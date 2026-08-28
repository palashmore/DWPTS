using System.Text;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Serilog;
using DWPTS.API.Middleware;
using DWPTS.API.Services;
using DWPTS.Application.Common;
using DWPTS.Application.Interfaces;
using DWPTS.Application.Validators;
using DWPTS.Infrastructure.Data;
using DWPTS.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .CreateLogger();

builder.Host.UseSerilog();

// Database Configuration - SQL Server with SQLite fallback for lightweight development
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "Server=(localdb)\\mssqllocaldb;Database=DWPTS_DB;Trusted_Connection=True;MultipleActiveResultSets=true";

var useSqlite = builder.Configuration.GetValue<bool>("UseSqlite", false);

builder.Services.AddDbContext<DWPTSDbContext>((sp, options) =>
{
    var currentUserService = sp.GetService<ICurrentUserService>();
    if (useSqlite || connectionString.Contains(".db"))
    {
        options.UseSqlite(connectionString.Contains(".db") ? connectionString : "Data Source=dwpts.db");
    }
    else
    {
        options.UseSqlServer(connectionString);
    }
});

// Dependency Injection
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();

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

// Validators
builder.Services.AddValidatorsFromAssemblyContaining<LoginRequestValidator>();

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

// CORS
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
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "DWPTS API", Version = "v1", Description = "Daily Work Planning & Tracking System REST API" });
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

app.UseMiddleware<ExceptionMiddleware>();

app.UseSwagger();
app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "DWPTS API v1"));

app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.MapGet("/", () => Results.Ok(new 
{ 
    status = "Healthy", 
    service = "DWPTS API", 
    version = "1.0", 
    docs = "/swagger",
    timestamp = DateTime.UtcNow 
}));

app.Run();

public partial class Program { }
