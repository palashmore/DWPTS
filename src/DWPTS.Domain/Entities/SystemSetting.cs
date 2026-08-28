namespace DWPTS.Domain.Entities;

public class SystemSetting
{
    public int SettingId { get; set; }
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string DataType { get; set; } = "String"; // String, Decimal, Boolean, Int
    public bool IsEditable { get; set; } = true;
}

