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
    <div class="calendar-page" *ngIf="calendar">
      <div class="page-title-row">
        <div>
          <h2>Monthly Planning Calendar</h2>
          <p class="subtitle">{{ calendar.monthName }} - Workload, Leaves & Holidays Overview</p>
        </div>

        <div class="month-nav">
          <button class="btn btn-secondary btn-sm" (click)="changeMonth(-1)">◀ Prev Month</button>
          <span class="month-title">{{ calendar.monthName }}</span>
          <button class="btn btn-secondary btn-sm" (click)="changeMonth(1)">Next Month ▶</button>
        </div>
      </div>

      <!-- Month Summary Bar -->
      <div class="kpi-grid">
        <div class="kpi-card kpi-primary">
          <span class="kpi-label">Total Work Hours</span>
          <span class="kpi-value">{{ calendar.totalWorkHours }}h</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">Meeting Hours</span>
          <span class="kpi-value">{{ calendar.totalMeetingHours }}h</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">Combined Total</span>
          <span class="kpi-value">{{ calendar.combinedTotalHours }}h</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">Working Days</span>
          <span class="kpi-value">{{ calendar.workingDaysCount }}</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">Holidays / Leaves</span>
          <span class="kpi-value">{{ calendar.holidaysCount }} / {{ calendar.leaveDaysCount }}</span>
        </div>
      </div>

      <!-- Calendar Grid -->
      <div class="calendar-grid-container dwpts-card">
        <div class="calendar-header-grid">
          <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
        </div>

        <div class="calendar-days-grid">
          <div *ngFor="let empty of leadingEmptyDays" class="day-cell empty"></div>
          <div *ngFor="let day of calendar.days" class="day-cell" [ngClass]="day.status.toLowerCase()" (click)="openDay(day)">
            <div class="cell-top">
              <span class="day-num">{{ day.dayNumber }}</span>
              <span class="status-tag" *ngIf="day.status !== 'NoEntry'">{{ day.status }}</span>
            </div>

            <div class="cell-body" *ngIf="day.totalHours > 0">
              <div class="cell-hours"><strong>{{ day.totalHours }}h</strong></div>
              <div class="cell-breakdown">W: {{ day.workHours }}h | M: {{ day.meetingHours }}h</div>
            </div>

            <div class="cell-body special" *ngIf="day.isHoliday || day.isLeave">
              <span class="special-label">{{ day.holidayName || day.leaveType || 'Leave' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-title-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .month-nav { display: flex; align-items: center; gap: 12px; }
    .month-title { font-size: 15px; font-weight: 700; color: #0f172a; min-width: 130px; text-align: center; }
    .calendar-grid-container { padding: 16px; }
    .calendar-header-grid { display: grid; grid-template-columns: repeat(7, 1fr); text-align: center; font-weight: 700; font-size: 12px; color: #64748b; padding-bottom: 10px; border-bottom: 1px solid #e2e8f0; }
    .calendar-days-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; margin-top: 8px; }
    .day-cell { min-height: 86px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 8px; cursor: pointer; transition: all 0.15s; display: flex; flex-direction: column; justify-content: space-between; }
    .day-cell:hover { border-color: #2563eb; transform: translateY(-1px); box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
    .day-cell.empty { background: transparent; border: none; cursor: default; }
    .day-cell.complete { border-left: 4px solid #16a34a; background: #f0fdf4; }
    .day-cell.overcapacity { border-left: 4px solid #dc2626; background: #fef2f2; }
    .day-cell.underplanned { border-left: 4px solid #ea580c; background: #fff7ed; }
    .day-cell.holiday { border-left: 4px solid #991b1b; background: #fee2e2; }
    .day-cell.leave { border-left: 4px solid #d97706; background: #fef3c7; }
    .day-cell.weekend { background: #f8fafc; color: #94a3b8; }
    .cell-top { display: flex; justify-content: space-between; align-items: center; }
    .day-num { font-weight: 700; font-size: 13px; }
    .status-tag { font-size: 9.5px; font-weight: 700; padding: 1px 4px; border-radius: 3px; background: #e2e8f0; }
    .cell-hours { font-size: 14px; font-weight: 700; color: #0f172a; }
    .cell-breakdown { font-size: 10px; color: #64748b; }
    .special-label { font-size: 11px; font-weight: 600; color: #991b1b; }
  `]
})
export class CalendarComponent implements OnInit {
  year = new Date().getFullYear();
  month = new Date().getMonth() + 1;
  calendar: CalendarMonth | null = null;
  leadingEmptyDays: number[] = [];

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit() {
    this.loadCalendar();
  }

  loadCalendar() {
    this.api.getCalendar(this.year, this.month).subscribe(res => {
      if (res.success && res.data) {
        this.calendar = res.data;
        if (this.calendar.days.length > 0) {
          const firstDayDate = new Date(this.calendar.days[0].date);
          const emptyCount = firstDayDate.getDay();
          this.leadingEmptyDays = Array(emptyCount).fill(0);
        }
      }
    });
  }

  changeMonth(delta: number) {
    this.month += delta;
    if (this.month > 12) { this.month = 1; this.year++; }
    if (this.month < 1) { this.month = 12; this.year--; }
    this.loadCalendar();
  }

  openDay(day: CalendarDay) {
    const dStr = new Date(day.date).toISOString().substring(0, 10);
    this.router.navigate(['/daily-work'], { queryParams: { date: dStr } });
  }
}
