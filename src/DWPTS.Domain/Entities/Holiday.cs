using DWPTS.Domain.Common;
using DWPTS.Shared.Enums;

namespace DWPTS.Domain.Entities;

public class Holiday : BaseEntity
{
    public int HolidayId { get; set; }
    public DateTime HolidayDate { get; set; }
    public string HolidayName { get; set; } = string.Empty;
    public HolidayTypeEnum HolidayType { get; set; } = HolidayTypeEnum.PublicHoliday;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
}

