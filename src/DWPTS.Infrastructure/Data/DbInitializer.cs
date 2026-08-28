using Microsoft.EntityFrameworkCore;
using DWPTS.Domain.Entities;
using DWPTS.Shared.Constants;
using DWPTS.Shared.Enums;

namespace DWPTS.Infrastructure.Data;

public static class DbInitializer
{
    public static async Task SeedAsync(DWPTSDbContext context)
    {
        // 1. Seed Roles
        if (!await context.Roles.AnyAsync())
        {
            var roles = new List<Role>
            {
                new() { Name = Roles.Admin, Description = "Full system administration" },
                new() { Name = Roles.Manager, Description = "Team review, capacity monitoring and reports" },
                new() { Name = Roles.Employee, Description = "Daily work planning and tracking" }
            };
            await context.Roles.AddRangeAsync(roles);
            await context.SaveChangesAsync();
        }

        var adminRole = await context.Roles.FirstAsync(r => r.Name == Roles.Admin);
        var managerRole = await context.Roles.FirstAsync(r => r.Name == Roles.Manager);
        var employeeRole = await context.Roles.FirstAsync(r => r.Name == Roles.Employee);

        // 2. Seed Work Item Types
        if (!await context.WorkItemTypes.AnyAsync())
        {
            var types = new List<WorkItemType>
            {
                new() { Name = "Task", Code = "TASK", Description = "General development or administrative task" },
                new() { Name = "Bug", Code = "BUG", Description = "Defect or issue to be resolved" },
                new() { Name = "Product Backlog", Code = "PBI", Description = "Product feature or backlog item" },
                new() { Name = "Support", Code = "SUP", Description = "Production or customer support activity" },
                new() { Name = "Change Request", Code = "CR", Description = "Client or system change request" },
                new() { Name = "Research", Code = "RND", Description = "Research, spike or POC" },
                new() { Name = "Other", Code = "OTH", Description = "Other work" }
            };
            await context.WorkItemTypes.AddRangeAsync(types);
            await context.SaveChangesAsync();
        }

        // 3. Seed Categories
        if (!await context.WorkEntryCategories.AnyAsync())
        {
            var categories = new List<WorkEntryCategory>
            {
                new() { Name = "Development", Description = "Core software development", ColorCode = "#2563eb" },
                new() { Name = "Bug Fix", Description = "Resolving defects & issues", ColorCode = "#dc2626" },
                new() { Name = "Support", Description = "Client & production support", ColorCode = "#ea580c" },
                new() { Name = "Utility", Description = "Data upload & scripts", ColorCode = "#0d9488" },
                new() { Name = "Discussion", Description = "Technical and functional discussions", ColorCode = "#8b5cf6" },
                new() { Name = "Meeting", Description = "Standups, syncs & walkthroughs", ColorCode = "#4f46e5" },
                new() { Name = "Testing", Description = "Unit and system testing", ColorCode = "#16a34a" },
                new() { Name = "Code Review", Description = "Peer code reviews", ColorCode = "#0284c7" },
                new() { Name = "Deployment", Description = "Release and deployment activities", ColorCode = "#7c3aed" },
                new() { Name = "Documentation", Description = "Technical docs and reports", ColorCode = "#64748b" }
            };
            await context.WorkEntryCategories.AddRangeAsync(categories);
            await context.SaveChangesAsync();
        }

        // 4. Seed Meeting Types & Meetings
        if (!await context.MeetingTypes.AnyAsync())
        {
            var mTypes = new List<MeetingType>
            {
                new() { Name = "Daily Standup", Description = "Scrum daily synchronization" },
                new() { Name = "Client Sync", Description = "External customer and client sync" },
                new() { Name = "Technical Walkthrough", Description = "Architecture & walkthrough meeting" },
                new() { Name = "Review & Planning", Description = "Sprint and capacity planning" }
            };
            await context.MeetingTypes.AddRangeAsync(mTypes);
            await context.SaveChangesAsync();
        }

        if (!await context.Meetings.AnyAsync())
        {
            var standupType = await context.MeetingTypes.FirstOrDefaultAsync();
            var meetings = new List<Meeting>
            {
                new() { MeetingName = "Daily Stand Up", DefaultDurationHours = 0.5m, Description = "Daily team standup", MeetingTypeId = standupType?.MeetingTypeId },
                new() { MeetingName = "BYD SYNC UP Meeting", DefaultDurationHours = 1.0m, Description = "BYD integration sync", MeetingTypeId = standupType?.MeetingTypeId },
                new() { MeetingName = "DMS Walkthrough Meeting", DefaultDurationHours = 1.0m, Description = "DMS system walkthrough", MeetingTypeId = standupType?.MeetingTypeId },
                new() { MeetingName = "CRM Walkthrough Meeting", DefaultDurationHours = 1.0m, Description = "CRM feature review", MeetingTypeId = standupType?.MeetingTypeId },
                new() { MeetingName = "FC Clarification", DefaultDurationHours = 0.5m, Description = "Functional consultant review", MeetingTypeId = standupType?.MeetingTypeId },
                new() { MeetingName = "Sprint Planning", DefaultDurationHours = 1.0m, Description = "Sprint planning meeting", MeetingTypeId = standupType?.MeetingTypeId }
            };
            await context.Meetings.AddRangeAsync(meetings);
            await context.SaveChangesAsync();
        }

        // 5. Seed Leave Types
        if (!await context.LeaveTypes.AnyAsync())
        {
            var leaveTypes = new List<LeaveType>
            {
                new() { Name = "Casual Leave", Code = "CL", Description = "Casual Leave", IsPaid = true },
                new() { Name = "Sick Leave", Code = "SL", Description = "Medical Leave", IsPaid = true },
                new() { Name = "Paid Leave", Code = "PL", Description = "Earned Leave", IsPaid = true },
                new() { Name = "Unpaid Leave", Code = "LWP", Description = "Leave Without Pay", IsPaid = false },
                new() { Name = "Holiday", Code = "HOL", Description = "Official Holiday", IsPaid = true }
            };
            await context.LeaveTypes.AddRangeAsync(leaveTypes);
            await context.SaveChangesAsync();
        }

        // 6. Seed System Settings
        if (!await context.SystemSettings.AnyAsync())
        {
            var settings = new List<SystemSetting>
            {
                new() { Key = "DailyCapacityHours", Value = "8.0", Description = "Standard working capacity per day in hours", DataType = "Decimal" },
                new() { Key = "CompanyName", Value = "DWPTS Enterprise", Description = "Organization Name", DataType = "String" },
                new() { Key = "AllowOvertime", Value = "true", Description = "Allow logging effort over capacity", DataType = "Boolean" },
                new() { Key = "OvertimeThresholdHours", Value = "8.0", Description = "Hours after which overtime is flagged", DataType = "Decimal" }
            };
            await context.SystemSettings.AddRangeAsync(settings);
            await context.SaveChangesAsync();
        }

        // 7. Seed Default Users & Employees
        if (!await context.Users.AnyAsync())
        {
            // Seed Admin Employee
            var adminEmp = new Employee
            {
                EmployeeCode = "EMP001",
                FirstName = "Admin",
                LastName = "User",
                Email = "admin@dwpts.local",
                Department = "Information Technology",
                Designation = "System Administrator",
                DailyCapacityHours = 8.0m,
                IsActive = true
            };
            await context.Employees.AddAsync(adminEmp);
            await context.SaveChangesAsync();

            var adminUser = new User
            {
                Username = "admin",
                Email = "admin@dwpts.local",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                IsActive = true,
                EmployeeId = adminEmp.EmployeeId
            };
            await context.Users.AddAsync(adminUser);
            await context.SaveChangesAsync();

            await context.UserRoles.AddAsync(new UserRole { UserId = adminUser.UserId, RoleId = adminRole.RoleId });

            // Seed Manager Employee
            var managerEmp = new Employee
            {
                EmployeeCode = "EMP002",
                FirstName = "Team",
                LastName = "Manager",
                Email = "manager@dwpts.local",
                Department = "Engineering",
                Designation = "Engineering Lead",
                DailyCapacityHours = 8.0m,
                IsActive = true
            };
            await context.Employees.AddAsync(managerEmp);
            await context.SaveChangesAsync();

            var managerUser = new User
            {
                Username = "manager",
                Email = "manager@dwpts.local",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Manager@123"),
                IsActive = true,
                EmployeeId = managerEmp.EmployeeId
            };
            await context.Users.AddAsync(managerUser);
            await context.SaveChangesAsync();

            await context.UserRoles.AddAsync(new UserRole { UserId = managerUser.UserId, RoleId = managerRole.RoleId });

            // Seed Developer / Employee (default employee for Excel imports)
            var devEmp = new Employee
            {
                EmployeeCode = "EMP003",
                FirstName = "Software",
                LastName = "Engineer",
                Email = "employee@dwpts.local",
                Department = "Engineering",
                Designation = "Senior Software Engineer",
                ManagerId = managerEmp.EmployeeId,
                DailyCapacityHours = 8.0m,
                IsActive = true
            };
            await context.Employees.AddAsync(devEmp);
            await context.SaveChangesAsync();

            var devUser = new User
            {
                Username = "employee",
                Email = "employee@dwpts.local",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Employee@123"),
                IsActive = true,
                EmployeeId = devEmp.EmployeeId
            };
            await context.Users.AddAsync(devUser);
            await context.SaveChangesAsync();

            await context.UserRoles.AddAsync(new UserRole { UserId = devUser.UserId, RoleId = employeeRole.RoleId });

            await context.SaveChangesAsync();
        }
    }
}

