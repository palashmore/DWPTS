using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using DWPTS.Application.DTOs;
using DWPTS.Application.Interfaces;
using DWPTS.Domain.Entities;
using DWPTS.Infrastructure.Data;
using DWPTS.Shared.Models;

namespace DWPTS.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly DWPTSDbContext _context;
    private readonly IConfiguration _config;

    public AuthService(DWPTSDbContext context, IConfiguration config)
    {
        _context = context;
        _config = config;
    }

    public async Task<ApiResponse<LoginResponseDto>> LoginAsync(LoginRequestDto request)
    {
        var user = await _context.Users
            .Include(u => u.Employee)
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => (u.Username == request.UsernameOrEmail || u.Email == request.UsernameOrEmail) && u.IsActive);

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            return ApiResponse<LoginResponseDto>.Fail("Invalid username or password.");
        }

        user.LastLoginAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        var roles = user.UserRoles.Select(ur => ur.Role.Name).ToList();
        var token = GenerateJwtToken(user, roles);

        var response = new LoginResponseDto
        {
            Token = token,
            RefreshToken = Guid.NewGuid().ToString("N"),
            ExpiresAt = DateTime.UtcNow.AddHours(24),
            User = new UserProfileDto
            {
                UserId = user.UserId,
                Username = user.Username,
                Email = user.Email,
                EmployeeId = user.EmployeeId,
                EmployeeCode = user.Employee?.EmployeeCode,
                FullName = user.Employee?.FullName ?? user.Username,
                Department = user.Employee?.Department,
                Designation = user.Employee?.Designation,
                Roles = roles
            }
        };

        return ApiResponse<LoginResponseDto>.Ok(response, "Login successful.");
    }

    public async Task<ApiResponse<UserProfileDto>> GetProfileAsync(int userId)
    {
        var user = await _context.Users
            .Include(u => u.Employee)
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.UserId == userId);

        if (user == null) return ApiResponse<UserProfileDto>.Fail("User not found.");

        var profile = new UserProfileDto
        {
            UserId = user.UserId,
            Username = user.Username,
            Email = user.Email,
            EmployeeId = user.EmployeeId,
            EmployeeCode = user.Employee?.EmployeeCode,
            FullName = user.Employee?.FullName ?? user.Username,
            Department = user.Employee?.Department,
            Designation = user.Employee?.Designation,
            Roles = user.UserRoles.Select(ur => ur.Role.Name).ToList()
        };

        return ApiResponse<UserProfileDto>.Ok(profile);
    }

    public async Task<ApiResponse<UserProfileDto>> RegisterAsync(RegisterRequestDto request)
    {
        if (await _context.Users.AnyAsync(u => u.Username == request.Username || u.Email == request.Email))
        {
            return ApiResponse<UserProfileDto>.Fail("Username or email is already registered.");
        }

        var employee = new Employee
        {
            EmployeeCode = "EMP" + new Random().Next(1000, 9999),
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            Department = request.Department,
            Designation = request.Designation,
            DailyCapacityHours = 8.0m,
            IsActive = true
        };
        await _context.Employees.AddAsync(employee);
        await _context.SaveChangesAsync();

        var user = new User
        {
            Username = request.Username,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            IsActive = true,
            EmployeeId = employee.EmployeeId
        };
        await _context.Users.AddAsync(user);
        await _context.SaveChangesAsync();

        var role = await _context.Roles.FirstOrDefaultAsync(r => r.Name == request.Role) 
                   ?? await _context.Roles.FirstAsync(r => r.Name == "EMPLOYEE");
        
        await _context.UserRoles.AddAsync(new UserRole { UserId = user.UserId, RoleId = role.RoleId });
        await _context.SaveChangesAsync();

        return await GetProfileAsync(user.UserId);
    }

    private string GenerateJwtToken(User user, List<string> roles)
    {
        var jwtSecret = _config["Jwt:Key"] ?? "DWPTS_SUPER_SECRET_KEY_FOR_JWT_AUTHENTICATION_AND_SIGNING_2026";
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.UserId.ToString()),
            new(ClaimTypes.Name, user.Username),
            new(ClaimTypes.Email, user.Email)
        };

        if (user.EmployeeId.HasValue)
        {
            claims.Add(new Claim("EmployeeId", user.EmployeeId.Value.ToString()));
        }

        foreach (var role in roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"] ?? "DWPTS.API",
            audience: _config["Jwt:Audience"] ?? "DWPTS.Client",
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

