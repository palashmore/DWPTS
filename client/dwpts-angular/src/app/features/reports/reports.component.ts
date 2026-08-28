import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { WeeklyReport, MonthlyReport, YearlyReport } from '../../core/models/models';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="reports-page">
      <div class="page-title-row">
        <div>
          <h2>📑 Executive Summaries & Productivity Matrix</h2>
          <p class="subtitle">Weekly breakdown, Monthly matrix, and Yearly trend comparisons</p>
        </div>
        <div class="report-tabs">
          <button class="btn btn-pill" [ngClass]="activeTab === 'weekly' ? 'btn-primary' : 'btn-secondary'" (click)="setTab('weekly')">Weekly Summary</button>
          <button class="btn btn-pill" [ngClass]="activeTab === 'monthly' ? 'btn-primary' : 'btn-secondary'" (click)="setTab('monthly')">Monthly Report</button>
          <button class="btn btn-pill" [ngClass]="activeTab === 'yearly' ? 'btn-primary' : 'btn-secondary'" (click)="setTab('yearly')">Yearly Summary</button>
        </div>
      </div>

      <!-- Weekly Report -->
      <div *ngIf="activeTab === 'weekly'">
        <div class="dwpts-card">
          <div class="card-header">
            <div>
              <h3>Weekly Summary (Week 35)</h3>
              <span class="subtitle">Monday - Friday Daily Work & Meeting Time Breakdown</span>
            </div>
            <button class="btn btn-secondary btn-sm btn-pill" (click)="exportWeekly()">📥 Export Excel</button>
          </div>

          <div class="dwpts-table-container">
            <table class="dwpts-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Day</th>
                  <th>Planned (h)</th>
                  <th>Meeting (h)</th>
                  <th>Work (h)</th>
                  <th>Actual Total (h)</th>
                  <th>Variance</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let d of sampleWeekly">
                  <td>{{ d.date }}</td>
                  <td><strong>{{ d.dayName }}</strong></td>
                  <td>{{ d.plannedHours }}h</td>
                  <td>{{ d.meetingHours }}h</td>
                  <td>{{ d.workHours }}h</td>
                  <td><strong style="color: var(--text-gold);">{{ d.actualHours }}h</strong></td>
                  <td><span style="color: #34D399;">{{ d.varianceHours }}h</span></td>
                  <td><span class="badge status-completed">{{ d.status }}</span></td>
                </tr>
                <tr class="table-total-row">
                  <td colspan="2">Weekly Total</td>
                  <td>40.0h</td>
                  <td>2.0h</td>
                  <td>38.0h</td>
                  <td>40.0h</td>
                  <td>0.0h</td>
                  <td><span class="badge status-completed">100% Utilized</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Monthly Report -->
      <div *ngIf="activeTab === 'monthly'">
        <div class="dwpts-card">
          <div class="card-header">
            <div>
              <h3>Monthly Matrix - August 2026</h3>
              <span class="subtitle">Weekly Rolled-up Capacity, Workload & Leaves</span>
            </div>
            <button class="btn btn-secondary btn-sm btn-pill" (click)="exportMonthly()">📥 Export Excel</button>
          </div>

          <div class="dwpts-table-container">
            <table class="dwpts-table">
              <thead>
                <tr>
                  <th>Week #</th>
                  <th>Period</th>
                  <th>Work Effort (h)</th>
                  <th>Meeting Effort (h)</th>
                  <th>Combined Total (h)</th>
                  <th>Working Days</th>
                  <th>Holidays</th>
                  <th>Leaves</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let w of sampleMonthly">
                  <td><strong>{{ w.week }}</strong></td>
                  <td>{{ w.period }}</td>
                  <td>{{ w.workHours }}h</td>
                  <td>{{ w.meetingHours }}h</td>
                  <td><strong style="color: var(--text-gold);">{{ w.totalHours }}h</strong></td>
                  <td>{{ w.workingDays }}</td>
                  <td>{{ w.holidays }}</td>
                  <td>{{ w.leaves }}</td>
                  <td><span class="badge status-completed">100% Util</span></td>
                </tr>
                <tr class="table-total-row">
                  <td colspan="2">Monthly Total</td>
                  <td>160.0h</td>
                  <td>16.0h</td>
                  <td>176.0h</td>
                  <td>22</td>
                  <td>1</td>
                  <td>0</td>
                  <td><span class="badge status-completed">Optimal Capacity</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Yearly Report -->
      <div *ngIf="activeTab === 'yearly'">
        <div class="dwpts-card">
          <div class="card-header">
            <div>
              <h3>Yearly Executive Matrix (2026)</h3>
              <span class="subtitle">Full Year Work Hours, Meeting Load & Capacity Trends</span>
            </div>
            <button class="btn btn-secondary btn-sm btn-pill" (click)="exportYearly()">📥 Export Excel</button>
          </div>

          <div class="dwpts-table-container">
            <table class="dwpts-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Total Work Effort (hrs)</th>
                  <th>Total Meeting Effort (hrs)</th>
                  <th>Combined Total (hrs)</th>
                  <th>Working Days</th>
                  <th>Holidays</th>
                  <th>Leaves</th>
                  <th>Utilization %</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let m of sampleYearly">
                  <td><strong>{{ m.month }}</strong></td>
                  <td>{{ m.workHours }}h</td>
                  <td>{{ m.meetingHours }}h</td>
                  <td><strong style="color: var(--text-gold);">{{ m.totalHours }}h</strong></td>
                  <td>{{ m.workingDays }}</td>
                  <td>{{ m.holidays }}</td>
                  <td>{{ m.leaves }}</td>
                  <td><span class="badge status-completed">{{ m.utilization }}%</span></td>
                </tr>
                <tr class="table-grand-total">
                  <td>Grand Total (YTD)</td>
                  <td>1,320.0h</td>
                  <td>120.0h</td>
                  <td>1,440.0h</td>
                  <td>180</td>
                  <td>8</td>
                  <td>4</td>
                  <td><span class="badge status-completed">100% Optimal</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reports-page { display: flex; flex-direction: column; gap: 20px; }
    .page-title-row { display: flex; justify-content: space-between; align-items: center; }
    .page-title-row h2 { font-size: 22px; font-weight: 800; color: var(--text-primary); }
    .subtitle { font-size: 13px; color: var(--text-muted); margin-top: 4px; }
    .report-tabs { display: flex; gap: 10px; }
    .table-total-row td {
      background: var(--bg-surface-elevated);
      font-weight: 800;
      color: var(--text-primary);
      border-top: 2px solid var(--border-gold);
    }
    .table-grand-total td {
      background: rgba(214, 179, 106, 0.15);
      font-weight: 800;
      color: var(--text-gold);
      border-top: 2px solid var(--gold-primary);
    }
  `]
})
export class ReportsComponent implements OnInit {
  activeTab: 'weekly' | 'monthly' | 'yearly' = 'yearly';

  sampleWeekly = [
    { date: '2026-08-24', dayName: 'Monday', plannedHours: 8, meetingHours: 0.5, workHours: 7.5, actualHours: 8, varianceHours: 0, status: 'Completed' },
    { date: '2026-08-25', dayName: 'Tuesday', plannedHours: 8, meetingHours: 1.0, workHours: 7.0, actualHours: 8, varianceHours: 0, status: 'Completed' },
    { date: '2026-08-26', dayName: 'Wednesday', plannedHours: 8, meetingHours: 0.0, workHours: 8.0, actualHours: 8, varianceHours: 0, status: 'Completed' },
    { date: '2026-08-27', dayName: 'Thursday', plannedHours: 8, meetingHours: 0.5, workHours: 7.5, actualHours: 8, varianceHours: 0, status: 'Completed' },
    { date: '2026-08-28', dayName: 'Friday', plannedHours: 8, meetingHours: 0.0, workHours: 8.0, actualHours: 8, varianceHours: 0, status: 'Completed' }
  ];

  sampleMonthly = [
    { week: 'Week 32', period: 'Aug 03 - Aug 07', workHours: 38, meetingHours: 2, totalHours: 40, workingDays: 5, holidays: 0, leaves: 0 },
    { week: 'Week 33', period: 'Aug 10 - Aug 14', workHours: 37, meetingHours: 3, totalHours: 40, workingDays: 5, holidays: 0, leaves: 0 },
    { week: 'Week 34', period: 'Aug 17 - Aug 21', workHours: 32, meetingHours: 0, totalHours: 32, workingDays: 4, holidays: 1, leaves: 0 },
    { week: 'Week 35', period: 'Aug 24 - Aug 28', workHours: 38, meetingHours: 2, totalHours: 40, workingDays: 5, holidays: 0, leaves: 0 }
  ];

  sampleYearly = [
    { month: 'January 2026', workHours: 168, meetingHours: 12, totalHours: 180, workingDays: 22, holidays: 1, leaves: 0, utilization: 100 },
    { month: 'February 2026', workHours: 152, meetingHours: 8, totalHours: 160, workingDays: 20, holidays: 0, leaves: 0, utilization: 100 },
    { month: 'March 2026', workHours: 168, meetingHours: 16, totalHours: 184, workingDays: 23, holidays: 0, leaves: 0, utilization: 100 },
    { month: 'April 2026', workHours: 154, meetingHours: 14, totalHours: 168, workingDays: 21, holidays: 2, leaves: 1, utilization: 100 },
    { month: 'May 2026', workHours: 160, meetingHours: 16, totalHours: 176, workingDays: 22, holidays: 1, leaves: 1, utilization: 100 },
    { month: 'June 2026', workHours: 166, meetingHours: 10, totalHours: 176, workingDays: 22, holidays: 0, leaves: 0, utilization: 100 },
    { month: 'July 2026', workHours: 172, meetingHours: 12, totalHours: 184, workingDays: 23, holidays: 1, leaves: 1, utilization: 100 },
    { month: 'August 2026', workHours: 160, meetingHours: 16, totalHours: 176, workingDays: 22, holidays: 1, leaves: 0, utilization: 100 }
  ];

  constructor(private api: ApiService) {}

  ngOnInit() {}

  setTab(tab: 'weekly' | 'monthly' | 'yearly') {
    this.activeTab = tab;
  }

  exportWeekly() {
    this.api.exportWeeklyExcel('2026-08-24').subscribe(blob => this.downloadBlob(blob, 'Weekly_Summary_Week35.xlsx'));
  }

  exportMonthly() {
    this.api.exportMonthlyExcel(2026, 8).subscribe(blob => this.downloadBlob(blob, 'Monthly_Report_Aug2026.xlsx'));
  }

  exportYearly() {
    this.api.exportYearlyExcel(2026).subscribe(blob => this.downloadBlob(blob, 'Yearly_Summary_2026.xlsx'));
  }

  private downloadBlob(blob: Blob, name: string) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
  }
}
