using DWPTS.Domain.Common;

namespace DWPTS.Domain.Entities;

public class DailySummary : BaseEntity
{
    public int DailySummaryId { get; set; }
    public int EmployeeId { get; set; }
    public Employee? Employee { get; set; }
    public DateTime SummaryDate { get; set; }
    public decimal CapacityHours { get; set; } = 8.0m;
    public decimal PlannedHours { get; set; }
    public decimal MeetingHours { get; set; }
    public decimal WorkHours { get; set; }
    public decimal TotalEffortHours { get; set; }
    public decimal VarianceHours { get; set; }
    public decimal OvertimeHours { get; set; }
    public decimal UtilizationPercentage { get; set; }
    public string Status { get; set; } = "Completed";
}
