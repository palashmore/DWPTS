namespace DWPTS.Shared.Enums;

public enum WorkItemTypeEnum
{
    Task = 1,
    Bug = 2,
    ProductBacklog = 3,
    Support = 4,
    ChangeRequest = 5,
    Research = 6,
    Other = 7
}

public enum WorkItemStatusEnum
{
    New = 1,
    InProgress = 2,
    Completed = 3,
    Ongoing = 4,
    OnHold = 5,
    Fixed = 6,
    Closed = 7
}

public enum HolidayTypeEnum
{
    PublicHoliday = 1,
    CompanyHoliday = 2,
    OptionalHoliday = 3,
    Weekend = 4
}

public enum LeaveTypeEnum
{
    CasualLeave = 1,
    SickLeave = 2,
    PaidLeave = 3,
    UnpaidLeave = 4,
    Holiday = 5
}

public enum LeaveStatusEnum
{
    Pending = 1,
    Approved = 2,
    Rejected = 3,
    Cancelled = 4
}

public enum ImportJobStatusEnum
{
    Pending = 1,
    Processing = 2,
    Completed = 3,
    CompletedWithWarnings = 4,
    Failed = 5
}

