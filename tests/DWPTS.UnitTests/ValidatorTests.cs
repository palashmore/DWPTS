using Xunit;
using FluentAssertions;
using DWPTS.Application.DTOs;
using DWPTS.Application.Validators;

namespace DWPTS.UnitTests;

public class ValidatorTests
{
    private readonly CreateWorkEntryValidator _workEntryValidator = new();
    private readonly CreateWorkItemValidator _workItemValidator = new();

    [Fact]
    public void WorkEntryValidator_ShouldFail_WhenDescriptionAndEffortAreEmpty()
    {
        var dto = new CreateWorkEntryDto
        {
            WorkDate = DateTime.Today,
            Description = "",
            MeetingEffortHours = 0,
            WorkEffortHours = 0
        };

        var result = _workEntryValidator.Validate(dto);
        result.IsValid.Should().BeFalse();
    }

    [Fact]
    public void WorkEntryValidator_ShouldFail_WhenEffortIsNegative()
    {
        var dto = new CreateWorkEntryDto
        {
            WorkDate = DateTime.Today,
            Description = "Test task",
            MeetingEffortHours = -1,
            WorkEffortHours = 4
        };

        var result = _workEntryValidator.Validate(dto);
        result.IsValid.Should().BeFalse();
    }

    [Fact]
    public void WorkItemValidator_ShouldPass_ForValidInput()
    {
        var dto = new CreateWorkItemDto
        {
            WorkItemNumber = "316850",
            Title = "Security features configuration"
        };

        var result = _workItemValidator.Validate(dto);
        result.IsValid.Should().BeTrue();
    }
}
