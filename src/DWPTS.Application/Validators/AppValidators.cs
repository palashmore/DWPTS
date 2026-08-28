using FluentValidation;
using DWPTS.Application.DTOs;

namespace DWPTS.Application.Validators;

public class LoginRequestValidator : AbstractValidator<LoginRequestDto>
{
    public LoginRequestValidator()
    {
        RuleFor(x => x.UsernameOrEmail).NotEmpty().WithMessage("Username or email is required.");
        RuleFor(x => x.Password).NotEmpty().WithMessage("Password is required.");
    }
}

public class CreateWorkEntryValidator : AbstractValidator<CreateWorkEntryDto>
{
    public CreateWorkEntryValidator()
    {
        RuleFor(x => x.WorkDate).NotEmpty().WithMessage("Work date is required.");
        RuleFor(x => x.Description).NotEmpty().WithMessage("Description is required.")
            .MaximumLength(1000).WithMessage("Description cannot exceed 1000 characters.");
        RuleFor(x => x.MeetingEffortHours).GreaterThanOrEqualTo(0).WithMessage("Meeting effort cannot be negative.");
        RuleFor(x => x.WorkEffortHours).GreaterThanOrEqualTo(0).WithMessage("Work effort cannot be negative.");
        RuleFor(x => x.PlannedEffortHours).GreaterThanOrEqualTo(0).WithMessage("Planned effort cannot be negative.");
        RuleFor(x => x).Must(x => x.MeetingEffortHours + x.WorkEffortHours > 0 || !string.IsNullOrWhiteSpace(x.Description))
            .WithMessage("Work entry must have either effort or valid description.");
    }
}

public class CreateWorkItemValidator : AbstractValidator<CreateWorkItemDto>
{
    public CreateWorkItemValidator()
    {
        RuleFor(x => x.WorkItemNumber).NotEmpty().WithMessage("Work item / task number is required.")
            .MaximumLength(50).WithMessage("Work item number cannot exceed 50 characters.");
        RuleFor(x => x.Title).NotEmpty().WithMessage("Title is required.")
            .MaximumLength(200).WithMessage("Title cannot exceed 200 characters.");
    }
}

public class CreateCategoryValidator : AbstractValidator<CreateCategoryDto>
{
    public CreateCategoryValidator()
    {
        RuleFor(x => x.Name).NotEmpty().WithMessage("Category name is required.")
            .MaximumLength(100).WithMessage("Category name cannot exceed 100 characters.");
    }
}

public class CreateLeaveValidator : AbstractValidator<CreateLeaveDto>
{
    public CreateLeaveValidator()
    {
        RuleFor(x => x.LeaveTypeId).GreaterThan(0).WithMessage("Leave type is required.");
        RuleFor(x => x.FromDate).NotEmpty().WithMessage("From date is required.");
        RuleFor(x => x.ToDate).GreaterThanOrEqualTo(x => x.FromDate).WithMessage("To date must be on or after From date.");
        RuleFor(x => x.DurationDays).GreaterThan(0).WithMessage("Duration must be greater than 0.");
    }
}

