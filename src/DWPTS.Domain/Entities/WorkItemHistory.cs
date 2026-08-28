using DWPTS.Domain.Common;

namespace DWPTS.Domain.Entities;

public class WorkItemHistory : BaseEntity
{
    public int HistoryId { get; set; }
    public int WorkItemId { get; set; }
    public WorkItem? WorkItem { get; set; }
    public DateTime ActionDate { get; set; }
    public decimal EffortLoggedHours { get; set; }
    public string? Status { get; set; }
    public string? Remarks { get; set; }
    public string? ActionBy { get; set; }
}
