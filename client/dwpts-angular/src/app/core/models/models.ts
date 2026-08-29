export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

export interface PagedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface UserProfile {
  userId: number;
  username: string;
  email: string;
  employeeId?: number;
  employeeCode?: string;
  fullName?: string;
  department?: string;
  designation?: string;
  dailyCapacityHours?: number;
  roles: string[];
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  expiresAt: string;
  user: UserProfile;
}

export interface WorkEntry {
  workEntryId: number;
  employeeId: number;
  employeeCode?: string;
  employeeName?: string;
  username?: string;
  workDate: string;
  dayName?: string;
  workItemId?: number;
  workItemNumber?: string;
  taskNumber?: string;
  description: string;
  categoryId?: number;
  categoryName?: string;
  categoryColor?: string;
  meetingId?: number;
  meetingName?: string;
  plannedEffortHours: number;
  meetingEffortHours: number;
  workEffortHours: number;
  totalEffortHours: number;
  varianceHours: number;
  status: string;
  remarks?: string;
  createdAt: string;
  remarksHistory?: WorkEntryRemark[];
}

export interface WorkEntryRemark {
  remarkId: number;
  workEntryId: number;
  username?: string;
  remarkText: string;
  status?: string;
  createdAt: string;
}

export interface DailyWorkScreen {
  date: string;
  dayName: string;
  employeeId: number;
  employeeName: string;
  dailyCapacityHours: number;
  totalPlannedHours: number;
  totalMeetingHours: number;
  totalWorkHours: number;
  totalActualHours: number;
  remainingCapacityHours: number;
  overtimeHours: number;
  utilizationPercentage: number;
  isOverCapacity: boolean;
  isHoliday: boolean;
  holidayName?: string;
  isLeave: boolean;
  leaveReason?: string;
  entries: WorkEntry[];
}

export interface WorkItem {
  workItemId: number;
  workItemNumber: string;
  workItemTypeId?: number;
  workItemTypeName?: string;
  title: string;
  description?: string;
  externalReference?: string;
  status: string;
  priority: string;
  dueDate?: string;
  totalEffortLoggedHours: number;
  daysWorkedCount: number;
  firstWorkedDate?: string;
  lastWorkedDate?: string;
  createdAt: string;
}

export interface WorkItemTimeline {
  workItemId: number;
  workItemNumber: string;
  title: string;
  totalEffort: number;
  timeline: {
    workDate: string;
    effortHours: number;
    status?: string;
    remarks?: string;
    employeeName?: string;
  }[];
}

export interface Category {
  categoryId: number;
  name: string;
  description?: string;
  colorCode?: string;
  isActive: boolean;
  totalEntriesCount: number;
  totalEffortHours: number;
}

export interface Meeting {
  meetingId: number;
  meetingName: string;
  meetingTypeId?: number;
  meetingTypeName?: string;
  defaultDurationHours: number;
  description?: string;
  isActive: boolean;
}

export interface MeetingAnalysis {
  meetingId: number;
  meetingName: string;
  totalHours: number;
  occurrencesCount: number;
  averageDurationHours: number;
  percentageOfTotalEffort: number;
}

export interface Holiday {
  holidayId: number;
  holidayDate: string;
  holidayName: string;
  holidayType: string;
  description?: string;
  isActive: boolean;
}

export interface Leave {
  employeeLeaveId: number;
  employeeId: number;
  employeeName?: string;
  leaveTypeId: number;
  leaveTypeName?: string;
  fromDate: string;
  toDate: string;
  durationDays: number;
  durationHours: number;
  reason?: string;
  status: string;
  approverRemarks?: string;
}

export interface CalendarMonth {
  year: number;
  month: number;
  monthName: string;
  totalWorkHours: number;
  totalMeetingHours: number;
  combinedTotalHours: number;
  workingDaysCount: number;
  holidaysCount: number;
  leaveDaysCount: number;
  days: CalendarDay[];
}

export interface CalendarDay {
  date: string;
  dayNumber: number;
  dayName: string;
  isWeekend: boolean;
  isHoliday: boolean;
  holidayName?: string;
  isLeave: boolean;
  leaveType?: string;
  plannedHours: number;
  meetingHours: number;
  workHours: number;
  totalHours: number;
  capacityHours: number;
  status: string;
  entriesCount: number;
}

export interface DashboardSummary {
  date: string;
  capacityHours: number;
  plannedHours: number;
  actualHours: number;
  meetingHours: number;
  workHours: number;
  remainingHours: number;
  overtimeHours: number;
  utilizationPercentage: number;
  weeklyActualHours: number;
  monthlyActualHours: number;
  todayEntries: WorkEntry[];
  dailyEffortTrend: { label: string; workHours: number; meetingHours: number; totalHours: number; plannedHours: number; capacityHours: number }[];
  categoryDistribution: { categoryName: string; colorCode?: string; totalHours: number; percentage: number }[];
  meetingDistribution: { meetingName: string; totalHours: number; percentage: number }[];
  teamSummary?: {
    totalMembers: number;
    totalCapacity: number;
    totalPlanned: number;
    totalActual: number;
    totalMeetings: number;
    totalOvertime: number;
    averageUtilization: number;
    memberUtilizations: { employeeId: number; employeeName: string; plannedHours: number; actualHours: number; meetingHours: number; workHours: number; utilizationPercentage: number }[];
  };
}

export interface WeeklyReport {
  weekNumber: number;
  startDate: string;
  endDate: string;
  workingDays: number;
  holidays: number;
  leaveDays: number;
  plannedHours: number;
  meetingHours: number;
  workHours: number;
  actualHours: number;
  varianceHours: number;
  overtimeHours: number;
  utilizationPercentage: number;
  dailyBreakdown: { date: string; dayName: string; plannedHours: number; meetingHours: number; workHours: number; actualHours: number; varianceHours: number; status: string }[];
  categoryBreakdown: { categoryName: string; colorCode?: string; totalHours: number; percentage: number }[];
  meetingBreakdown: { meetingName: string; totalHours: number; percentage: number }[];
  workItemBreakdown: { workItemNumber: string; title: string; totalHours: number; entriesCount: number }[];
}

export interface MonthlyReport {
  year: number;
  month: number;
  monthName: string;
  workingDays: number;
  holidays: number;
  leaveDays: number;
  plannedHours: number;
  meetingHours: number;
  workHours: number;
  actualHours: number;
  overtimeHours: number;
  averageHoursPerDay: number;
  utilizationPercentage: number;
  varianceHours: number;
  weeks: WeeklyReport[];
}

export interface YearlyReport {
  year: number;
  grandTotalWorkHours: number;
  grandTotalMeetingHours: number;
  grandCombinedTotalHours: number;
  months: {
    monthName: string;
    month: number;
    year: number;
    workEffortHours: number;
    meetingEffortHours: number;
    combinedTotalHours: number;
    workingDays: number;
    holidays: number;
    leaveDays: number;
    plannedHours: number;
    varianceHours: number;
    overtimeHours: number;
    utilizationPercentage: number;
  }[];
}

export interface ImportPreview {
  fileName: string;
  totalSheets: number;
  totalRows: number;
  validRows: number;
  warningRows: number;
  errorRows: number;
  duplicateRows: number;
  detectedSheets: string[];
  previewRows: ImportRowPreview[];
}

export interface ImportRowPreview {
  rowIndex: number;
  sheetName: string;
  date?: string;
  rawTask?: string;
  normalizedTaskNumber?: string;
  normalizedTitle?: string;
  category?: string;
  meeting?: string;
  meetingEffort: number;
  workEffort: number;
  totalEffort: number;
  remarks?: string;
  status: string;
  message?: string;
}

export interface ImportResult {
  importJobId: number;
  totalProcessed: number;
  importedCount: number;
  skippedCount: number;
  errorsCount: number;
  status: string;
  messages: string[];
}
