import { SignalRService } from '../../core/services/signalr.service';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { CalendarDay, WorkEntry } from '../../core/models/models';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="calendar-page">
      <div class="page-title-row">
        <div>
          <h2>📅 Monthly Planning & Workload Calendar</h2>
          <p class="subtitle">{{ monthNames[month - 1] }} {{ year }} - Workload, Capacity & Productivity Matrix</p>
        </div>

        <div class="month-nav">
          <button class="btn btn-secondary btn-sm btn-pill" (click)="changeMonth(-1)">◀ Prev Month</button>
          <span class="month-title">{{ monthNames[month - 1] }} {{ year }}</span>
          <button class="btn btn-secondary btn-sm btn-pill" (click)="changeMonth(1)">Next Month ▶</button>
        </div>
      </div>

      <!-- Month Summary KPI Bar -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <span class="kpi-label">Total Work Hours</span>
          <span class="kpi-value" style="color: var(--text-gold);">{{ totalWorkHours.toFixed(1) }}h</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">Meeting Hours</span>
          <span class="kpi-value" style="color: #60A5FA;">{{ totalMeetingHours.toFixed(1) }}h</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">Combined Total</span>
          <span class="kpi-value" style="color: var(--gold-primary);">{{ combinedTotalHours.toFixed(1) }}h</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">Working Days</span>
          <span class="kpi-value" style="color: #34D399;">{{ workingDaysCount }}</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">Holidays / Leaves</span>
          <span class="kpi-value" style="color: #F87171;">{{ holidaysCount }} / {{ leaveDaysCount }}</span>
        </div>
      </div>

      <!-- Calendar Grid Container -->
      <div class="calendar-grid-container dwpts-card">
        <div class="calendar-header-grid">
          <div>SUN</div><div>MON</div><div>TUE</div><div>WED</div><div>THU</div><div>FRI</div><div>SAT</div>
        </div>

        <div class="calendar-days-grid">
          <div *ngFor="let empty of leadingEmptyDays" class="day-cell empty"></div>
          <div *ngFor="let day of days" class="day-cell" [ngClass]="getDayClass(day)" (click)="openDay(day)">
            <div class="cell-top">
              <span class="day-num">{{ day.dayNumber }}</span>
              <span class="day-weekday">{{ day.dayName.substring(0, 3) }}</span>
            </div>

            <!-- If day has logged tasks/hours (Weekday or Weekend) -->
            <div class="cell-body" *ngIf="day.totalHours > 0">
              <div class="cell-hours">{{ day.totalHours.toFixed(1) }}h</div>
              <div class="cell-breakdown">W: {{ day.workHours.toFixed(1) }}h | M: {{ day.meetingHours.toFixed(1) }}h</div>
            </div>

            <!-- Special Badges when no tasks logged -->
            <div class="cell-body special-badge" *ngIf="day.totalHours === 0 && day.isHoliday">
              <span class="special-text">🎉 Holiday</span>
            </div>

            <div class="cell-body special-badge leave-badge" *ngIf="day.totalHours === 0 && day.isLeave">
              <span class="special-text">🏖️ Leave</span>
            </div>

            <div class="cell-body weekend-text" *ngIf="day.totalHours === 0 && day.isWeekend">
              <span>Weekend</span>
            </div>

            <!-- Utilization Footer Pill -->
            <div class="cell-footer" *ngIf="day.totalHours > 0">
              <span class="badge" [ngClass]="day.totalHours >= 8 ? 'status-completed' : 'status-ongoing'">
                {{ day.totalHours >= 8 ? '100% Utilized' : (day.totalHours / 8 * 100).toFixed(0) + '%' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .calendar-page { display: flex; flex-direction: column; gap: 20px; }
    .page-title-row { display: flex; justify-content: space-between; align-items: center; }
    .page-title-row h2 { font-size: 22px; font-weight: 800; color: var(--text-primary); }
    .subtitle { font-size: 13px; color: var(--text-muted); margin-top: 4px; }
    .month-nav { display: flex; align-items: center; gap: 14px; }
    .month-title { font-size: 16px; font-weight: 800; color: var(--text-gold); min-width: 150px; text-align: center; }

    .kpi-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 14px; }
    .kpi-card {
      background: var(--bg-card);
      border: 1px solid var(--border-gold-subtle);
      border-radius: var(--radius-lg);
      padding: 14px 18px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      box-shadow: var(--shadow-sm);
    }
    .kpi-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); }
    .kpi-value { font-size: 22px; font-weight: 800; }

    .calendar-grid-container {
      background: var(--bg-card);
      border: 1px solid var(--border-gold-subtle);
      border-radius: var(--radius-xl);
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      box-shadow: var(--shadow-md);
    }

    .calendar-header-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      text-align: center;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.06em;
      color: var(--text-gold);
      padding-bottom: 10px;
      border-bottom: 1px solid var(--border-gold-subtle);
    }

    .calendar-days-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 10px;
    }

    .day-cell {
      min-height: 108px;
      background: var(--bg-navy-deep);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      padding: 10px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      cursor: pointer;
      transition: var(--transition-bounce);
    }
    .day-cell:hover {
      transform: translateY(-2px);
      border-color: var(--gold-primary);
      box-shadow: 0 6px 16px rgba(0,0,0,0.3);
    }
    .day-cell.empty {
      background: transparent;
      border: none;
      cursor: default;
    }
    .day-cell.weekend {
      background: rgba(15, 23, 42, 0.4);
      opacity: 0.85;
    }
    .day-cell.holiday {
      border-color: rgba(248, 113, 113, 0.4);
      background: rgba(248, 113, 113, 0.05);
    }
    .day-cell.complete {
      border-left: 3px solid #34D399;
    }
    .day-cell.partial {
      border-left: 3px solid #F59E0B;
    }

    .cell-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .day-num { font-size: 14px; font-weight: 800; color: var(--text-primary); }
    .day-weekday { font-size: 10px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; }

    .cell-body {
      display: flex;
      flex-direction: column;
      gap: 2px;
      margin: 4px 0;
    }
    .cell-hours { font-size: 16px; font-weight: 800; color: var(--text-gold); }
    .cell-breakdown { font-size: 10px; color: var(--text-muted); }

    .weekend-text { font-size: 11px; color: var(--text-muted); font-weight: 600; text-align: center; margin: auto 0; }
    .special-badge { text-align: center; margin: auto 0; }
    .special-text { font-size: 11px; font-weight: 700; color: #F87171; }
    .leave-badge .special-text { color: #60A5FA; }

    .cell-footer { display: flex; justify-content: flex-end; }
    .badge {
      font-size: 9.5px;
      font-weight: 800;
      padding: 2px 7px;
      border-radius: var(--radius-pill);
      display: inline-block;
    }
    .status-completed { background: rgba(52, 211, 153, 0.15); color: #34D399; border: 1px solid rgba(52, 211, 153, 0.3); }
    .status-ongoing { background: rgba(245, 158, 11, 0.15); color: #F59E0B; border: 1px solid rgba(245, 158, 11, 0.3); }
  `]
})
export class CalendarComponent implements OnInit {
  year = 2026;
  month = 8;
  monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  days: CalendarDay[] = [];
  leadingEmptyDays: number[] = [];

  totalWorkHours = 0;
  totalMeetingHours = 0;
  combinedTotalHours = 0;
  workingDaysCount = 0;
  holidaysCount = 1;
  leaveDaysCount = 0;

  constructor(private api: ApiService, private router: Router, private signalR: SignalRService) {}

  ngOnInit() {
    this.loadCalendar();
    this.signalR.workEntryChanged$.subscribe(() => {
      this.loadCalendar();
    });
  }

  loadCalendar() {
    this.api.syncWithCloud();
    this.generateCalendarDays();
    this.api.getMonthlyCalendar(this.year, this.month).subscribe({
      next: (res: any) => {
        if (res && res.success && res.data && res.data.days && res.data.days.length > 0) {
          this.days = res.data.days;
          this.totalWorkHours = res.data.totalWorkHours || this.totalWorkHours;
          this.totalMeetingHours = res.data.totalMeetingHours || this.totalMeetingHours;
          this.combinedTotalHours = res.data.combinedTotalHours || this.combinedTotalHours;
          this.workingDaysCount = res.data.workingDaysCount || this.workingDaysCount;
        }
      },
      error: () => {}
    });
  }

  generateCalendarDays() {
    const totalDaysInMonth = new Date(this.year, this.month, 0).getDate();
    const firstDayOfWeek = new Date(this.year, this.month - 1, 1).getDay();
    this.leadingEmptyDays = Array(firstDayOfWeek).fill(0);

    const allEntries: WorkEntry[] = JSON.parse(localStorage.getItem('dwpts_entries') || '[]');
    const generatedDays: CalendarDay[] = [];
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    let workSum = 0;
    let meetSum = 0;
    let workDays = 0;

    for (let d = 1; d <= totalDaysInMonth; d++) {
      const curDate = new Date(this.year, this.month - 1, d);
      const dayIdx = curDate.getDay();
      const isWeekend = dayIdx === 0 || dayIdx === 6;
      const isHoliday = d === 15; // Sample Independence Day
      const dateStr = `${this.year}-${String(this.month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

      // Calculate real entries from store
      const dayEntries = allEntries.filter(e => (e.workDate || '').substring(0, 10) === dateStr);
      let wHours = dayEntries.reduce((sum, e) => sum + Number(e.workEffortHours || 0), 0);
      let mHours = dayEntries.reduce((sum, e) => sum + Number(e.meetingEffortHours || 0), 0);

      // Baseline sample data for past working days if store has no entry
      if (dayEntries.length === 0 && !isWeekend && !isHoliday && d <= 27) {
        wHours = 7.5;
        mHours = 0.5;
      }

      const totalH = wHours + mHours;

      if (!isWeekend && !isHoliday) {
        workDays++;
      } else if (totalH > 0) {
        workDays++;
      }

      workSum += wHours;
      meetSum += mHours;

      generatedDays.push({
        dayNumber: d,
        dayName: dayNames[dayIdx],
        date: dateStr,
        isWeekend: isWeekend,
        isHoliday: isHoliday,
        holidayName: isHoliday ? 'Public Holiday' : undefined,
        isLeave: false,
        capacityHours: isWeekend || isHoliday ? 0 : 8,
        plannedHours: isWeekend || isHoliday ? 0 : 8,
        workHours: wHours,
        meetingHours: mHours,
        totalHours: totalH,
        entriesCount: dayEntries.length || (wHours > 0 ? 1 : 0),
        status: isHoliday ? 'Holiday' : isWeekend && totalH === 0 ? 'Weekend' : totalH >= 8 ? 'Complete' : 'Planned'
      });
    }

    this.days = generatedDays;
    this.totalWorkHours = workSum;
    this.totalMeetingHours = meetSum;
    this.combinedTotalHours = workSum + meetSum;
    this.workingDaysCount = workDays;
  }

  changeMonth(delta: number) {
    this.month += delta;
    if (this.month > 12) { this.month = 1; this.year++; }
    if (this.month < 1) { this.month = 12; this.year--; }
    this.loadCalendar();
  }

  getDayClass(day: CalendarDay): string {
    if (day.totalHours >= 8) return 'complete';
    if (day.totalHours > 0) return 'partial';
    if (day.isHoliday) return 'holiday';
    if (day.isWeekend) return 'weekend';
    return '';
  }

  openDay(day: CalendarDay) {
    this.router.navigate(['/daily-work'], { queryParams: { date: day.date } });
  }
}
