using Microsoft.EntityFrameworkCore;
using DWPTS.Application.DTOs;
using DWPTS.Application.Interfaces;
using DWPTS.Domain.Entities;
using DWPTS.Infrastructure.Data;
using DWPTS.Shared.Models;

namespace DWPTS.Infrastructure.Services;

public class EmployeeService : IEmployeeService
{
    private readonly DWPTSDbContext _context;

    public EmployeeService(DWPTSDbContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<List<EmployeeDto>>> GetAllEmployeesAsync()
    {
        var employees = await _context.Employees
            .Include(e => e.Manager)
            .AsNoTracking()
            .OrderBy(e => e.FirstName)
            .Select(e => new EmployeeDto
            {
                EmployeeId = e.EmployeeId,
                EmployeeCode = e.EmployeeCode,
                FirstName = e.FirstName,
                LastName = e.LastName,
                Email = e.Email,
                Department = e.Department,
                Designation = e.Designation,
                DailyCapacityHours = e.DailyCapacityHours,
                IsActive = e.IsActive,
                ManagerId = e.ManagerId,
                ManagerName = e.Manager != null ? e.Manager.FullName : null
            })
            .ToListAsync();

        return ApiResponse<List<EmployeeDto>>.Ok(employees);
    }

    public async Task<ApiResponse<EmployeeDto>> GetEmployeeByIdAsync(int id)
    {
        var e = await _context.Employees
            .Include(e => e.Manager)
            .FirstOrDefaultAsync(e => e.EmployeeId == id);

        if (e == null) return ApiResponse<EmployeeDto>.Fail("Employee not found.");

        return ApiResponse<EmployeeDto>.Ok(new EmployeeDto
        {
            EmployeeId = e.EmployeeId,
            EmployeeCode = e.EmployeeCode,
            FirstName = e.FirstName,
            LastName = e.LastName,
            Email = e.Email,
            Department = e.Department,
            Designation = e.Designation,
            DailyCapacityHours = e.DailyCapacityHours,
            IsActive = e.IsActive,
            ManagerId = e.ManagerId,
            ManagerName = e.Manager?.FullName
        });
    }

    public async Task<ApiResponse<EmployeeDto>> CreateEmployeeAsync(CreateEmployeeDto request)
    {
        var employee = new Employee
        {
            EmployeeCode = request.EmployeeCode,
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            Department = request.Department,
            Designation = request.Designation,
            DailyCapacityHours = request.DailyCapacityHours,
            ManagerId = request.ManagerId,
            IsActive = true
        };

        await _context.Employees.AddAsync(employee);
        await _context.SaveChangesAsync();

        return await GetEmployeeByIdAsync(employee.EmployeeId);
    }

    public async Task<ApiResponse<EmployeeDto>> UpdateEmployeeAsync(int id, UpdateEmployeeDto request)
    {
        var employee = await _context.Employees.FindAsync(id);
        if (employee == null) return ApiResponse<EmployeeDto>.Fail("Employee not found.");

        employee.EmployeeCode = request.EmployeeCode;
        employee.FirstName = request.FirstName;
        employee.LastName = request.LastName;
        employee.Email = request.Email;
        employee.Department = request.Department;
        employee.Designation = request.Designation;
        employee.DailyCapacityHours = request.DailyCapacityHours;
        employee.ManagerId = request.ManagerId;
        employee.IsActive = request.IsActive;

        await _context.SaveChangesAsync();
        return await GetEmployeeByIdAsync(employee.EmployeeId);
    }
}

