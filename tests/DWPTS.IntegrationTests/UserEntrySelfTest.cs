using Xunit;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using DWPTS.Application.Common;
using DWPTS.Application.DTOs;
using DWPTS.Domain.Entities;
using DWPTS.Infrastructure.Data;
using DWPTS.Infrastructure.Services;

namespace DWPTS.IntegrationTests;

public class UserEntrySelfTest
{
    [Fact]
    public async Task CreateUserEntry_ShouldSaveToDatabase_AndCalculateDailyMetrics()
    {
        var options = new DbContextOptionsBuilder<DWPTSDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        var mockUser = new Mock<ICurrentUserService>();
        mockUser.Setup(m => m.UserId).Returns(1);
        mockUser.Setup(m => m.EmployeeId).Returns(1);
        mockUser.Setup(m => m.Username).Returns("admin");

        var context = new DWPTSDbContext(options, mockUser.Object);

        // Seed Employee & Category
        var emp = new Employee { EmployeeId = 1, EmployeeCode = "EMP001", FirstName = "Admin", LastName = "User", DailyCapacityHours = 8.0m, IsActive = true };
        var cat = new WorkEntryCategory { CategoryId = 1, Name = "Development", ColorCode = "#2563eb", IsActive = true };
        context.Employees.Add(emp);
        context.WorkEntryCategories.Add(cat);
        await context.SaveChangesAsync();

        var workEntryService = new WorkEntryService(context, mockUser.Object);

        // 1. Enter the exact Task from User Request
        var entryDto = new CreateWorkEntryDto
        {
            WorkDate = new DateTime(2026, 8, 27),
            TaskNumber = "358112",
            Description = "Task 358112: Dev : Password Reset requirement in User Account utility",
            CategoryId = 1,
            PlannedEffortHours = 8.0m,
            MeetingEffortHours = 0.0m,
            WorkEffortHours = 8.0m,
            Status = "In Progress",
            Remarks = "Progress notes or update"
        };

        var result = await workEntryService.CreateWorkEntryAsync(entryDto);

        // Assertions
        result.Success.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.TotalEffortHours.Should().Be(8.0m);
        result.Data.TaskNumber.Should().Be("358112");
        result.Data.CategoryName.Should().Be("Development");

        // 2. Verify Daily Screen Aggregations
        var dailyScreen = await workEntryService.GetDailyWorkAsync(new DateTime(2026, 8, 27), 1);
        dailyScreen.Success.Should().BeTrue();
        dailyScreen.Data!.TotalActualHours.Should().Be(8.0m);
        dailyScreen.Data.RemainingCapacityHours.Should().Be(0.0m);
        dailyScreen.Data.UtilizationPercentage.Should().Be(100.0m);
        dailyScreen.Data.Entries.Should().HaveCount(1);
    }
}
