using DWPTS.Domain.Common;

namespace DWPTS.Domain.Entities;

public class WorkEntryRemark : BaseEntity
{
    public int RemarkId { get; set; }
    public int WorkEntryId { get; set; }
    public WorkEntry? WorkEntry { get; set; }
    public int? UserId { get; set; }
    public User? User { get; set; }
    public string RemarkText { get; set; } = string.Empty;
    public string? Status { get; set; }
}
