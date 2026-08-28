using DWPTS.Domain.Common;
using DWPTS.Shared.Enums;

namespace DWPTS.Domain.Entities;

public class ImportJob : BaseEntity
{
    public int ImportJobId { get; set; }
    public string FileName { get; set; } = string.Empty;
    public long FileSizeBytes { get; set; }
    public int SheetCount { get; set; }
    public int TotalRows { get; set; }
    public int ValidRows { get; set; }
    public int WarningRows { get; set; }
    public int ErrorRows { get; set; }
    public int DuplicateRows { get; set; }
    public int ImportedRows { get; set; }
    public ImportJobStatusEnum Status { get; set; } = ImportJobStatusEnum.Pending;
    public string? ErrorLog { get; set; }
    
    public virtual ICollection<ImportJobDetail> Details { get; set; } = new List<ImportJobDetail>();
}

