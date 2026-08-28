namespace DWPTS.Domain.Entities;

public class ImportJobDetail
{
    public int DetailId { get; set; }
    public int ImportJobId { get; set; }
    public virtual ImportJob ImportJob { get; set; } = null!;
    
    public string SheetName { get; set; } = string.Empty;
    public int RowNumber { get; set; }
    public string? RawDate { get; set; }
    public string? RawTask { get; set; }
    public string? RawCategory { get; set; }
    public string? RawMeeting { get; set; }
    public string? RawMeetingEffort { get; set; }
    public string? RawWorkEffort { get; set; }
    public string? RawTotalEffort { get; set; }
    public string? RawRemarks { get; set; }
    
    public string? NormalizedTaskNumber { get; set; }
    public string Status { get; set; } = "Valid";
    public string? Message { get; set; }
}

