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
          <h2>Executive Summaries & Reports</h2>
          <p class="subtitle">Weekly breakdown, Monthly matrix, and Yearly trend comparisons</p>
        </div>
        <div class="report-tabs">
          <button class="btn" [ngClass]="activeTab === 'weekly' ? 'btn-primary' : 'btn-secondary'" (click)="setTab('weekly')">Weekly Summary</button>
          <button class="btn" [ngClass]="activeTab === 'monthly' ? 'btn-primary' : 'btn-secondary'" (click)="setTab('monthly')">Monthly Report</button>
          <button class="btn" [ngClass]="activeTab === 'yearly' ? 'btn-primary' : 'btn-secondary'" (click)="setTab('yearly')">Yearly Summary</button>
        </div>
      </div>

      <!-- Weekly Report -->
      <div *ngIf="activeTab === 'weekly' && weekly">
        <div class="dwpts-card">
          <div class="card-header">
            <h3>Weekly Summary (Week {{ weekly.weekNumber }})</h3>
            <button class="btn btn-success btn-sm" (click)="exportWeekly()">📥 Export Excel</button>
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
                <tr *ngFor="let d of weekly.dailyBreakdown">
                  <td>{{ d.date | date:'yyyy-MM-dd' }}</td>
                  <td><strong>{{ d.dayName }}</strong></td>
                  <td>{{ d.plannedHours }}h</td>
                  <td>{{ d.meetingHours }}h</td>
                  <td>{{ d.workHours }}h</td>
                  <td><strong>{{ d.actualHours }}h</strong></td>
                  <td [style.color]="d.varianceHours > 0 ? '#ea580c' : '#16a34a'">{{ d.varianceHours }}h</td>
                  <td><span class="badge status-completed">{{ d.status }}</span></td>
                </tr>
                <tr style="background: #f8fafc; font-weight: 700;">
                  <td colspan="2">Weekly Total</td>
                  <td>{{ weekly.plannedHours }}h</td>
                  <td>{{ weekly.meetingHours }}h</td>
                  <td>{{ weekly.workHours }}h</td>
                  <td>{{ weekly.actualHours }}h</td>
                  <td>{{ weekly.varianceHours }}h</td>
                  <td>{{ weekly.utilizationPercentage }}% Util</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Monthly Report -->
      <div *ngIf="activeTab === 'monthly' && monthly">
        <div class="dwpts-card">
          <div class="card-header">
            <h3>Monthly Report - {{ monthly.monthName }}</h3>
            <button class="btn btn-success btn-sm" (click)="exportMonthly()">📥 Export Excel</button>
          </div>

          <div class="dwpts-table-container">
            <table class="dwpts-table">
              <thead>
                <tr>
                  <th>Week #</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Work Effort (h)</th>
                  <th>Meeting Effort (h)</th>
                  <th>Combined Total (h)</th>
                  <th>Working Days</th>
                  <th>Holidays</th>
                  <th>Leave</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let w of monthly.weeks">
                  <td><strong>Week {{ w.weekNumber }}</strong></td>
                  <td>{{ w.startDate | date:'yyyy-MM-dd' }}</td>
                  <td>{{ w.endDate | date:'yyyy-MM-dd' }}</td>
                  <td>{{ w.workHours }}h</td>
                  <td>{{ w.meetingHours }}h</td>
                  <td><strong>{{ w.actualHours }}h</strong></td>
                  <td>{{ w.workingDays }}</td>
                  <td>{{ w.holidays }}</td>
                  <td>{{ w.leaveDays }}</td>
                </tr>
                <tr style="background: #f8fafc; font-weight: 700;">
                  <td colspan="3">Monthly Total</td>
                  <td>{{ monthly.workHours }}h</td>
                  <td>{{ monthly.meetingHours }}h</td>
                  <td>{{ monthly.actualHours }}h</td>
                  <td>{{ monthly.workingDays }}</td>
                  <td>{{ monthly.holidays }}</td>
                  <td>{{ monthly.leaveDays }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Yearly Report -->
      <div *ngIf="activeTab === 'yearly' && yearly">
        <div class="dwpts-card">
          <div class="card-header">
            <h3>Yearly Summary Matrix ({{ selectedYear }})</h3>
            <button class="btn btn-success btn-sm" (click)="exportYearly()">📥 Export Excel</button>
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
                  <th>Leave</th>
                  <th>Utilization %</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let m of yearly.months">
                  <td><strong>{{ m.monthName }}</strong></td>
                  <td>{{ m.workEffortHours }}h</td>
                  <td>{{ m.meetingEffortHours }}h</td>
                  <td><strong>{{ m.combinedTotalHours }}h</strong></td>
                  <td>{{ m.workingDays }}</td>
                  <td>{{ m.holidays }}</td>
                  <td>{{ m.leaveDays }}</td>
                  <td><span class="badge status-completed">{{ m.utilizationPercentage }}%</span></td>
                </tr>
                <tr style="background: #eff6ff; font-weight: 800; color: #1e40af;">
                  <td>Grand Total</td>
                  <td>{{ yearly.grandTotalWorkHours }}h</td>
                  <td>{{ yearly.grandTotalMeetingHours }}h</td>
                  <td>{{ yearly.grandCombinedTotalHours }}h</td>
                  <td colspan="4"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-title-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .report-tabs { display: flex; gap: 8px; }
  `]
})
export class ReportsComponent implements OnInit {
  activeTab: 'weekly' | 'monthly' | 'yearly' = 'yearly';
  selectedYear = 2026;
  weekly: WeeklyReport | null = null;
  monthly: MonthlyReport | null = null;
  yearly: YearlyReport | null = null;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadData();
  }

  setTab(tab: 'weekly' | 'monthly' | 'yearly') {
    this.activeTab = tab;
    this.loadData();
  }

  loadData() {
    if (this.activeTab === 'weekly') {
      this.api.getWeeklyReport(new Date().toISOString().substring(0, 10)).subscribe(res => this.weekly = res.data || null);
    } else if (this.activeTab === 'monthly') {
      this.api.getMonthlyReport(this.selectedYear, new Date().getMonth() + 1).subscribe(res => this.monthly = res.data || null);
    } else {
      this.api.getYearlyReport(this.selectedYear).subscribe(res => this.yearly = res.data || null);
    }
  }

  exportWeekly() {
    this.api.exportWeeklyExcel(new Date().toISOString().substring(0, 10)).subscribe(blob => this.downloadBlob(blob, 'Weekly_Summary.xlsx'));
  }

  exportMonthly() {
    this.api.exportMonthlyExcel(this.selectedYear, new Date().getMonth() + 1).subscribe(blob => this.downloadBlob(blob, 'Monthly_Report.xlsx'));
  }

  exportYearly() {
    this.api.exportYearlyExcel(this.selectedYear).subscribe(blob => this.downloadBlob(blob, 'Yearly_Summary.xlsx'));
  }

  private downloadBlob(blob: Blob, name: string) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
  }
}
