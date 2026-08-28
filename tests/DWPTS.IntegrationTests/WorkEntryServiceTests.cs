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

public class WorkEntryServiceTests
{
    private DWPTSDbContext CreateInMemoryContext()
    {
        var options = new DbContextOptionsBuilder<DWPTSDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        var mockUser = new Mock<ICurrentUserService>();
        mockUser.Setup(m => m.UserId).Returns(1);
        mockUser.Setup(m => m.EmployeeId).Returns(1);
        mockUser.Setup(m => m.Username).Returns("testuser");

        var context = new DWPTSDbContext(options, mockUser.Object);

        // Seed an employee
        context.Employees.Add(new Employee
        {
            EmployeeId = 1,
            EmployeeCode = "EMP001",
            FirstName = "Test",
            LastName = "Employee",
            DailyCapacityHours = 8.0m,
            IsActive = true
        });
        context.SaveChanges();

        return context;
    }

    [Fact]
    public async Task CreateWorkEntry_ShouldPersistAndCalculateTotalEffort()
    {
        var context = CreateInMemoryContext();
        var mockUser = new Mock<ICurrentUserService>();
        mockUser.Setup(m => m.EmployeeId).Returns(1);

        var service = new WorkEntryService(context, mockUser.Object);

        var dto = new CreateWorkEntryDto
        {
            EmployeeId = 1,
            WorkDate = new DateTime(2026, 1, 15),
            TaskNumber = "316850",
            Description = "Dev - Kobelco Security features",
            MeetingEffortHours = 1.5m,
            WorkEffortHours = 6.0m,
            PlannedEffortHours = 7.5m,
            Status = "In Progress"
        };

        var result = await service.CreateWorkEntryAsync(dto);

        result.Success.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.TotalEffortHours.Should().Be(7.5m);
        result.Data.VarianceHours.Should().Be(0.0m);

        // Verify DailyWork calculation
        var daily = await service.GetDailyWorkAsync(new DateTime(2026, 1, 15), 1);
        daily.Success.Should().BeTrue();
        daily.Data!.TotalActualHours.Should().Be(7.5m);
        daily.Data.RemainingCapacityHours.Should().Be(0.5m);
        daily.Data.OvertimeHours.Should().Be(0.0m);
    }

    [Fact]
    public async Task CopyEntries_ShouldDuplicateEntriesToTargetDate()
    {
        var context = CreateInMemoryContext();
        var mockUser = new Mock<ICurrentUserService>();
        mockUser.Setup(m => m.EmployeeId).Returns(1);

        var service = new WorkEntryService(context, mockUser.Object);

        var sourceDate = new DateTime(2026, 1, 15);
        var targetDate = new DateTime(2026, 1, 16);

        await service.CreateWorkEntryAsync(new CreateWorkEntryDto
        {
            EmployeeId = 1,
            WorkDate = sourceDate,
            Description = "Task 1",
            WorkEffortHours = 4.0m
        });

        await service.CreateWorkEntryAsync(new CreateWorkEntryDto
        {
            EmployeeId = 1,
            WorkDate = sourceDate,
            Description = "Task 2",
            MeetingEffortHours = 1.0m,
            WorkEffortHours = 3.0m
        });

        var copyResult = await service.CopyEntriesAsync(new CopyWorkEntriesRequestDto
        {
            SourceDate = sourceDate,
            TargetDate = targetDate,
            EmployeeId = 1
        });

        copyResult.Success.Should().BeTrue();

        var targetDaily = await service.GetDailyWorkAsync(targetDate, 1);
        targetDaily.Data!.Entries.Should().HaveCount(2);
        targetDaily.Data.TotalActualHours.Should().Be(8.0m);
    }
}
