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

public class ExcelImportValidationTests
{
    private const string ExcelFilePath = @"C:\Users\palashm\OneDrive - Excellon Software Pvt. Ltd\Desktop\Daily Task Planning.xlsx";

    private DWPTSDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<DWPTSDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        var mockUser = new Mock<ICurrentUserService>();
        mockUser.Setup(m => m.UserId).Returns(1);
        mockUser.Setup(m => m.EmployeeId).Returns(1);
        mockUser.Setup(m => m.Username).Returns("admin");

        var context = new DWPTSDbContext(options, mockUser.Object);

        context.Employees.Add(new Employee
        {
            EmployeeId = 1,
            EmployeeCode = "EMP001",
            FirstName = "Lead",
            LastName = "Developer",
            DailyCapacityHours = 8.0m,
            IsActive = true
        });
        context.SaveChanges();

        return context;
    }

    [Fact]
    public async Task ImportActualExcel_ShouldPreviewAndImportExactEfforts()
    {
        if (!File.Exists(ExcelFilePath)) return;

        var context = CreateContext();
        var mockUser = new Mock<ICurrentUserService>();
        mockUser.Setup(m => m.EmployeeId).Returns(1);
        mockUser.Setup(m => m.Username).Returns("admin");

        var importService = new ExcelImportService(context, mockUser.Object);
        var workEntryService = new WorkEntryService(context, mockUser.Object);
        var reportService = new ReportService(context, workEntryService);

        // 1. Preview
        using var stream = File.OpenRead(ExcelFilePath);
        var preview = await importService.PreviewExcelAsync(stream, "Daily Task Planning.xlsx");

        preview.Success.Should().BeTrue();
        preview.Data.Should().NotBeNull();
        preview.Data!.TotalRows.Should().BeGreaterThan(200);

        // 2. Confirm Import
        var confirmReq = new ConfirmImportRequestDto
        {
            EmployeeId = 1,
            RowsToImport = preview.Data.PreviewRows
        };

        var importResult = await importService.ConfirmImportAsync(confirmReq);
        importResult.Success.Should().BeTrue();
        importResult.Data!.ImportedCount.Should().BeGreaterThan(200);

        // 3. Verify Yearly Summary for 2025 and 2026
        var yearly2025 = await reportService.GetYearlyReportAsync(2025, 1);
        var yearly2026 = await reportService.GetYearlyReportAsync(2026, 1);

        yearly2025.Success.Should().BeTrue();
        yearly2026.Success.Should().BeTrue();

        var total2025 = yearly2025.Data!.GrandCombinedTotalHours;
        var total2026 = yearly2026.Data!.GrandCombinedTotalHours;
        var combinedTotal = total2025 + total2026;

        // November 2025 (160h) + December 2025 (148h) = 308h in 2025
        total2025.Should().Be(308.0m);

        // January 2026 (189h) + February 2026 (190h) + March 2026 (40h) + June 2026 (72h) = 491h in 2026
        total2026.Should().Be(491.0m);

        // Grand Total Across Workbook = 799.0h
        combinedTotal.Should().Be(799.0m);
    }
}
