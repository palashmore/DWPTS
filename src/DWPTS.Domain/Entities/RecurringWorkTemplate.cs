using DWPTS.Domain.Common;

namespace DWPTS.Domain.Entities;

public class RecurringWorkTemplate : BaseEntity
{
    public int TemplateId { get; set; }
    public int EmployeeId { get; set; }
    public Employee? Employee { get; set; }
    public string TemplateName { get; set; } = string.Empty;
    public string TaskNumber { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int? CategoryId { get; set; }
    public int? MeetingId { get; set; }
    public decimal DefaultWorkEffortHours { get; set; }
    public decimal DefaultMeetingEffortHours { get; set; }
    public bool IsActive { get; set; } = true;
}
