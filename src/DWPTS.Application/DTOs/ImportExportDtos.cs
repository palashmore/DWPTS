namespace DWPTS.Application.DTOs;

public class ImportPreviewDto
{
    public string FileName { get; set; } = string.Empty;
    public int TotalSheets { get; set; }
    public int TotalRows { get; set; }
    public int ValidRows { get; set; }
    public int WarningRows { get; set; }
    public int ErrorRows { get; set; }
    public int DuplicateRows { get; set; }
    public List<string> DetectedSheets { get; set; } = new();
    public List<ImportRowPreviewDto> PreviewRows { get; set; } = new();
}

public class ImportRowPreviewDto
{
    public int RowIndex { get; set; }
    public string SheetName { get; set; } = string.Empty;
    public DateTime? Date { get; set; }
    public string? RawTask { get; set; }
    public string? NormalizedTaskNumber { get; set; }
    public string? NormalizedTitle { get; set; }
    public string? Category { get; set; }
    public string? Meeting { get; set; }
    public decimal MeetingEffort { get; set; }
    public decimal WorkEffort { get; set; }
    public decimal TotalEffort { get; set; }
    public string? Remarks { get; set; }
    public string Status { get; set; } = "Valid"; // Valid, Warning, Error, Duplicate
    public string? Message { get; set; }
}

public class ConfirmImportRequestDto
{
    public int? EmployeeId { get; set; }
    public string DuplicateHandling { get; set; } = "Skip"; // Skip, Overwrite, CreateNew
    public List<ImportRowPreviewDto> RowsToImport { get; set; } = new();
}

public class ImportResultDto
{
    public int ImportJobId { get; set; }
    public int TotalProcessed { get; set; }
    public int ImportedCount { get; set; }
    public int SkippedCount { get; set; }
    public int ErrorsCount { get; set; }
    public string Status { get; set; } = "Completed";
    public List<string> Messages { get; set; } = new();
}

