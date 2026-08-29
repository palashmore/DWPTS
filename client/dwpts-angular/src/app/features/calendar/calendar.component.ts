import { SignalRService } from '../../core/services/signalr.service';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { CalendarMonth, CalendarDay } from '../../core/models/models';

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
          <span class="kpi-value" style="color: var(--text-gold);">{{ totalWorkHours }}h</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">Meeting Hours</span>
          <span class="kpi-value" style="color: #60A5FA;">{{ totalMeetingHours }}h</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">Combined Total</span>
          <span class="kpi-value" style="color: var(--gold-primary);">{{ combinedTotalHours }}h</span>
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

            <div class="cell-body" *ngIf="!day.isWeekend && !day.isHoliday && day.totalHours > 0">
              <div class="cell-hours">{{ day.totalHours }}h</div>
              <div class="cell-breakdown">W: {{ day.workHours }}h | M: {{ day.meetingHours }}h</div>
            </div>

            <div class="cell-body special-badge" *ngIf="day.isHoliday">
              <span class="special-text">🎉 Holiday</span>
            </div>

            <div class="cell-body special-badge leave-badge" *ngIf="day.isLeave">
              <span class="special-text">🏖️ Leave</span>
            </div>

            <div class="cell-body weekend-text" *ngIf="day.isWeekend">
              <span>Weekend</span>
            </div>

            <div class="cell-footer" *ngIf="!day.isWeekend && day.totalHours > 0">
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
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 16px;
      display: flex;
      flex-direction: column;
      box-shadow: var(--shadow-card);
    }
    .kpi-label { font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
    .kpi-value { font-size: 22px; font-weight: 800; margin-top: 4px; }

    .calendar-grid-container { padding: 24px; background: var(--bg-surface); }
    .calendar-header-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      text-align: center;
      font-weight: 800;
      font-size: 11.5px;
      color: var(--text-muted);
      letter-spacing: 0.08em;
      padding-bottom: 14px;
      border-bottom: 1px solid var(--border-subtle);
    }
    .calendar-days-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 10px; margin-top: 14px; }

    .day-cell {
      min-height: 105px;
      background: var(--bg-navy-deep);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 10px 12px;
      cursor: pointer;
      transition: var(--transition-smooth);
      display: flex;
      flex-direction: column;
      justify-content: space-between;

      &:hover {
        border-color: var(--gold-primary);
        transform: translateY(-2px);
        box-shadow: var(--gold-glow-subtle);
        background: var(--bg-surface-elevated);
      }

      &.empty { background: transparent; border: none; cursor: default; box-shadow: none; transform: none; }
      &.complete { border-left: 4px solid #34D399; }
      &.partial { border-left: 4px solid #FBBF24; }
      &.weekend { background: rgba(15, 23, 42, 0.4); opacity: 0.6; }
      &.holiday { border-left: 4px solid #F87171; background: rgba(248, 113, 113, 0.08); }
    }

    .cell-top { display: flex; justify-content: space-between; align-items: center; }
    .day-num { font-weight: 800; font-size: 14px; color: var(--text-primary); }
    .day-weekday { font-size: 10.5px; color: var(--text-muted); font-weight: 600; text-transform: uppercase; }

    .cell-body { display: flex; flex-direction: column; gap: 2px; margin: 6px 0; }
    .cell-hours { font-size: 16px; font-weight: 800; color: var(--text-gold); }
    .cell-breakdown { font-size: 10.5px; color: var(--text-secondary); font-weight: 500; }

    .special-badge { background: rgba(248, 113, 113, 0.15); padding: 4px 6px; border-radius: 4px; }
    .special-text { font-size: 11px; font-weight: 700; color: #F87171; }
    .leave-badge { background: rgba(251, 191, 36, 0.15); .special-text { color: #FBBF24; } }
    .weekend-text { font-size: 11px; color: var(--text-muted); font-style: italic; }

    .cell-footer { display: flex; justify-content: flex-start; }

    @media (max-width: 1024px) {
      .kpi-grid { grid-template-columns: repeat(3, 1fr); }
    }

    @media (max-width: 768px) {
      .page-title-row { flex-direction: column; align-items: flex-start; gap: 12px; }
      .month-nav { width: 100%; justify-content: space-between; }
      .kpi-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
      .calendar-grid-container { padding: 14px; overflow-x: auto; -webkit-overflow-scrolling: touch; }
      .calendar-header-grid, .calendar-days-grid { min-width: 600px; }
    }

    @media (max-width: 480px) {
      .kpi-grid { grid-template-columns: 1fr; }
      .month-title { min-width: 110px; font-size: 14px; }
    }
  `]
})
export class CalendarComponent implements OnInit {
  year = new Date().getFullYear();
  month = new Date().getMonth() + 1;
  monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  days: CalendarDay[] = [];
  leadingEmptyDays: number[] = [];

  totalWorkHours = 160;
  totalMeetingHours = 16;
  combinedTotalHours = 176;
  workingDaysCount = 22;
  holidaysCount = 1;
  leaveDaysCount = 0;

  constructor(private api: ApiService, private router: Router, private signalR: SignalRService) {}

  ngOnInit() {
    this.generateCalendarDays();
    this.signalR.workEntryChanged$.subscribe(() => {
      this.generateCalendarDays();
    });
  }

  generateCalendarDays() {
    const totalDaysInMonth = new Date(this.year, this.month, 0).getDate();
    const firstDayOfWeek = new Date(this.year, this.month - 1, 1).getDay();
    this.leadingEmptyDays = Array(firstDayOfWeek).fill(0);

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
      const isPastOrToday = d <= 28;

      let wHours = 0;
      let mHours = 0;
      let status = 'NoEntry';

      if (!isWeekend && !isHoliday) {
        workDays++;
        if (isPastOrToday) {
          wHours = 7.5;
          mHours = 0.5;
          status = 'Complete';
        } else {
          wHours = 8.0;
          mHours = 0.0;
          status = 'Planned';
        }
      }

      workSum += wHours;
      meetSum += mHours;

      generatedDays.push({
        dayNumber: d,
        dayName: dayNames[dayIdx],
        date: curDate.toISOString().substring(0, 10),
        isWeekend: isWeekend,
        isHoliday: isHoliday,
        holidayName: isHoliday ? 'Public Holiday' : undefined,
        isLeave: false,
        capacityHours: isWeekend || isHoliday ? 0 : 8,
        plannedHours: isWeekend || isHoliday ? 0 : 8,
        workHours: wHours,
        meetingHours: mHours,
        totalHours: wHours + mHours,
        entriesCount: wHours > 0 ? 1 : 0,
        status: isWeekend ? 'Weekend' : isHoliday ? 'Holiday' : status
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
    this.generateCalendarDays();
  }

  getDayClass(day: CalendarDay): string {
    if (day.isWeekend) return 'weekend';
    if (day.isHoliday) return 'holiday';
    if (day.totalHours >= 8) return 'complete';
    if (day.totalHours > 0) return 'partial';
    return '';
  }

  openDay(day: CalendarDay) {
    this.router.navigate(['/daily-work'], { queryParams: { date: day.date } });
  }
}
