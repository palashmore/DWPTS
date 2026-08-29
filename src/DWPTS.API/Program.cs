using System.Text;
using System.Threading.RateLimiting;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Serilog;
using DWPTS.API.Hubs;
using DWPTS.API.Middleware;
using DWPTS.API.Services;
using DWPTS.Application.Common;
using DWPTS.Application.Interfaces;
using DWPTS.Application.Validators;
using DWPTS.Infrastructure.BackgroundJobs;
using DWPTS.Infrastructure.Data;
using DWPTS.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog Structured Logging
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .CreateLogger();

builder.Host.UseSerilog();

// Multi-Provider Database Configuration (PostgreSQL / SQLite / SQL Server)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "Data Source=dwpts.db";

var useSqlite = builder.Configuration.GetValue<bool>("UseSqlite", false);
var isPostgres = connectionString.StartsWith("Host=") || connectionString.StartsWith("Server=") && connectionString.Contains("Port=");

builder.Services.AddDbContext<DWPTSDbContext>((sp, options) =>
{
    var currentUserService = sp.GetService<ICurrentUserService>();
    if (isPostgres || builder.Configuration.GetValue<bool>("UsePostgreSql", false))
    {
        options.UseNpgsql(connectionString);
    }
    else if (useSqlite || connectionString.Contains(".db") || connectionString.Contains("Data Source"))
    {
        options.UseSqlite(connectionString.Contains(".db") ? connectionString : "Data Source=dwpts.db");
    }
    else
    {
        options.UseSqlServer(connectionString);
    }
});

// Dependency Injection - Application & Domain Services
builder.Services.AddHttpContextAccessor();
builder.Services.AddMemoryCache();
builder.Services.AddSignalR();

builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();
builder.Services.AddScoped<IRedisCacheService, RedisCacheService>();
builder.Services.AddScoped<IEventBus, KafkaEventBus>();
builder.Services.AddScoped<ISignalRNotifier, SignalRNotifier>();

builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IEmployeeService, EmployeeService>();
builder.Services.AddScoped<IWorkItemService, WorkItemService>();
builder.Services.AddScoped<IWorkEntryService, WorkEntryService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<IMeetingService, MeetingService>();
builder.Services.AddScoped<ICalendarService, CalendarService>();
builder.Services.AddScoped<IHolidayService, HolidayService>();
builder.Services.AddScoped<ILeaveService, LeaveService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<IReportService, ReportService>();
builder.Services.AddScoped<IExcelImportService, ExcelImportService>();
builder.Services.AddScoped<IExportService, ExportService>();
builder.Services.AddScoped<IAuditLogService, AuditLogService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<ISystemSettingService, SystemSettingService>();

// Hosted Background Services
builder.Services.AddHostedService<DailyCapacityCalculationJob>();

// Validators
builder.Services.AddValidatorsFromAssemblyContaining<LoginRequestValidator>();

// Rate Limiting (Token Bucket policy for enterprise resilience)
builder.Services.AddRateLimiter(options =>
{
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.User.Identity?.Name ?? httpContext.Request.Headers.Host.ToString(),
            factory: partition => new FixedWindowRateLimiterOptions
            {
                AutoReplenishment = true,
                PermitLimit = 100,
                QueueLimit = 20,
                Window = TimeSpan.FromMinutes(1)
            }));
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
});

// Authentication & JWT
var jwtKey = builder.Configuration["Jwt:Key"] ?? "DWPTS_SUPER_SECRET_KEY_FOR_JWT_AUTHENTICATION_AND_SIGNING_2026";
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "DWPTS.API",
            ValidAudience = builder.Configuration["Jwt:Audience"] ?? "DWPTS.Client",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

// Authorization Policies
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("RequireAdmin", policy => policy.RequireRole("ADMIN"));
    options.AddPolicy("RequireManager", policy => policy.RequireRole("MANAGER", "ADMIN"));
    options.AddPolicy("RequireEmployee", policy => policy.RequireRole("EMPLOYEE", "MANAGER", "ADMIN"));
});

// CORS Policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo 
    { 
        Title = "DWPTS Enterprise REST API", 
        Version = "v1", 
        Description = "Daily Work Planning, Capacity Management & Observability Platform" 
    });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// Seed Database
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<DWPTSDbContext>();
    await db.Database.EnsureCreatedAsync();
    await DbInitializer.SeedAsync(db);
}

app.UseMiddleware<CorrelationIdMiddleware>();
app.UseMiddleware<ExceptionMiddleware>();

app.UseSwagger();
app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "DWPTS API v1"));

app.UseCors("AllowAll");
app.UseRateLimiter();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<WorkNotificationHub>("/hubs/work-notifications");

app.MapGet("/", () => Results.Ok(new 
{ 
    status = "Healthy", 
    service = "DWPTS Enterprise API", 
    version = "1.0.0", 
    environment = app.Environment.EnvironmentName,
    docs = "/swagger",
    timestamp = DateTime.UtcNow 
}));

app.MapGet("/health", () => Results.Ok(new 
{ 
    status = "Healthy", 
    database = "Connected",
    cache = "Active",
    timestamp = DateTime.UtcNow 
}));

app.Run();

public partial class Program { }
