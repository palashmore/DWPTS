using Microsoft.EntityFrameworkCore;
using DWPTS.Application.DTOs;
using DWPTS.Application.Interfaces;
using DWPTS.Domain.Entities;
using DWPTS.Infrastructure.Data;
using DWPTS.Shared.Models;

namespace DWPTS.Infrastructure.Services;

public class UserService : IUserService
{
    private readonly DWPTSDbContext _context;

    public UserService(DWPTSDbContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<PagedResult<UserDto>>> GetUsersAsync(PaginationFilter filter)
    {
        var query = _context.Users
            .Include(u => u.Employee)
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
        {
            var search = filter.SearchTerm.ToLower();
            query = query.Where(u => u.Username.ToLower().Contains(search) || u.Email.ToLower().Contains(search) || (u.Employee != null && (u.Employee.FirstName + " " + u.Employee.LastName).ToLower().Contains(search)));
        }

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(u => u.CreatedAt)
            .Skip((filter.PageNumber - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .Select(u => new UserDto
            {
                UserId = u.UserId,
                Username = u.Username,
                Email = u.Email,
                IsActive = u.IsActive,
                LastLoginAt = u.LastLoginAt,
                EmployeeId = u.EmployeeId,
                EmployeeName = u.Employee != null ? u.Employee.FullName : null,
                Roles = u.UserRoles.Select(ur => ur.Role.Name).ToList(),
                CreatedAt = u.CreatedAt
            })
            .ToListAsync();

        return ApiResponse<PagedResult<UserDto>>.Ok(new PagedResult<UserDto>
        {
            Items = items,
            PageNumber = filter.PageNumber,
            PageSize = filter.PageSize,
            TotalCount = total
        });
    }

    public async Task<ApiResponse<UserDto>> GetUserByIdAsync(int id)
    {
        var u = await _context.Users
            .Include(u => u.Employee)
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.UserId == id);

        if (u == null) return ApiResponse<UserDto>.Fail("User not found.");

        return ApiResponse<UserDto>.Ok(new UserDto
        {
            UserId = u.UserId,
            Username = u.Username,
            Email = u.Email,
            IsActive = u.IsActive,
            LastLoginAt = u.LastLoginAt,
            EmployeeId = u.EmployeeId,
            EmployeeName = u.Employee?.FullName,
            Roles = u.UserRoles.Select(ur => ur.Role.Name).ToList(),
            CreatedAt = u.CreatedAt
        });
    }

    public async Task<ApiResponse<UserDto>> CreateUserAsync(CreateUserDto request)
    {
        if (await _context.Users.AnyAsync(u => u.Username == request.Username || u.Email == request.Email))
            return ApiResponse<UserDto>.Fail("Username or email already exists.");

        var user = new User
        {
            Username = request.Username,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            IsActive = true,
            EmployeeId = request.EmployeeId
        };
        await _context.Users.AddAsync(user);
        await _context.SaveChangesAsync();

        if (request.Roles.Any())
        {
            var roles = await _context.Roles.Where(r => request.Roles.Contains(r.Name)).ToListAsync();
            foreach (var r in roles)
            {
                await _context.UserRoles.AddAsync(new UserRole { UserId = user.UserId, RoleId = r.RoleId });
            }
            await _context.SaveChangesAsync();
        }

        return await GetUserByIdAsync(user.UserId);
    }

    public async Task<ApiResponse<UserDto>> UpdateUserAsync(int id, UpdateUserDto request)
    {
        var user = await _context.Users
            .Include(u => u.UserRoles)
            .FirstOrDefaultAsync(u => u.UserId == id);

        if (user == null) return ApiResponse<UserDto>.Fail("User not found.");

        user.Email = request.Email;
        user.IsActive = request.IsActive;

        if (!string.IsNullOrWhiteSpace(request.Password))
        {
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
        }

        // Update Roles
        _context.UserRoles.RemoveRange(user.UserRoles);
        if (request.Roles.Any())
        {
            var roles = await _context.Roles.Where(r => request.Roles.Contains(r.Name)).ToListAsync();
            foreach (var r in roles)
            {
                await _context.UserRoles.AddAsync(new UserRole { UserId = user.UserId, RoleId = r.RoleId });
            }
        }

        await _context.SaveChangesAsync();
        return await GetUserByIdAsync(user.UserId);
    }

    public async Task<ApiResponse> DeleteUserAsync(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return ApiResponse.Fail("User not found.");

        user.IsDeleted = true;
        await _context.SaveChangesAsync();
        return ApiResponse.Ok("User deleted successfully.");
    }

    public async Task<ApiResponse<List<string>>> GetRolesAsync()
    {
        var roles = await _context.Roles.Select(r => r.Name).ToListAsync();
        return ApiResponse<List<string>>.Ok(roles);
    }
}

