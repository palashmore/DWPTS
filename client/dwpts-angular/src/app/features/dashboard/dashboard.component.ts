import { SignalRService } from '../../core/services/signalr.service';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { DashboardSummary } from '../../core/models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-page" *ngIf="data">
      <div class="page-title-row">
        <div>
          <h2>Executive Overview</h2>
          <p class="subtitle">Operational analytics, effort trends, and capacity monitoring</p>
        </div>
        <div class="date-badge-pill">📅 {{ data.date | date:'fullDate' }}</div>
      </div>

      <!-- Top KPI Row -->
      <div class="kpi-grid-5">
        <div class="kpi-card kpi-gold">
          <div class="kpi-header">
            <span class="kpi-label">Today's Effort</span>
            <span class="kpi-icon">⚡</span>
          </div>
          <span class="kpi-value">{{ data.actualHours }}h</span>
          <span class="kpi-sub">Capacity: {{ data.capacityHours }}h</span>
        </div>

        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-label">Planned</span>
            <span class="kpi-icon">🎯</span>
          </div>
          <span class="kpi-value">{{ data.plannedHours }}h</span>
          <span class="kpi-sub">Variance: {{ (data.actualHours - data.plannedHours).toFixed(1) }}h</span>
        </div>

        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-label">Work / Meeting</span>
            <span class="kpi-icon">👥</span>
          </div>
          <span class="kpi-value">{{ data.workHours }}h / {{ data.meetingHours }}h</span>
          <span class="kpi-sub">Work / Meetings</span>
        </div>

        <div class="kpi-card" [ngClass]="{'kpi-success': data.utilizationPercentage >= 90 && data.utilizationPercentage <= 110, 'kpi-warning': data.utilizationPercentage > 110, 'kpi-danger': data.utilizationPercentage < 80}">
          <div class="kpi-header">
            <span class="kpi-label">Utilization</span>
            <span class="kpi-icon">🚀</span>
          </div>
          <span class="kpi-value">{{ data.utilizationPercentage }}%</span>
          <span class="kpi-sub">{{ data.overtimeHours > 0 ? '+' + data.overtimeHours + 'h Overtime' : data.remainingHours + 'h Remaining' }}</span>
        </div>

        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-label">Month Total</span>
            <span class="kpi-icon">📈</span>
          </div>
          <span class="kpi-value">{{ data.monthlyActualHours }}h</span>
          <span class="kpi-sub">Week: {{ data.weeklyActualHours }}h</span>
        </div>
      </div>

      <!-- 7-Day Trend and Distributions -->
      <div class="analytics-grid">
        <div class="dwpts-card">
          <div class="card-header">
            <div>
              <h3>7-Day Effort Trend</h3>
              <span class="subtitle">Daily Work & Meeting Trajectory</span>
            </div>
          </div>

          <div class="trend-bars">
            <div class="bar-col" *ngFor="let item of data.dailyEffortTrend">
              <div class="bar-val">{{ item.totalHours }}h</div>
              <div class="stacked-bar">
                <div class="work-bar" [style.height.%]="(item.workHours / 12) * 100" title="Work: {{ item.workHours }}h"></div>
                <div class="meeting-bar" [style.height.%]="(item.meetingHours / 12) * 100" title="Meeting: {{ item.meetingHours }}h"></div>
              </div>
              <div class="bar-label">{{ item.label }}</div>
            </div>
          </div>
          <div class="bar-legend">
            <span class="legend-item"><span class="color-box work"></span> Work Effort</span>
            <span class="legend-item"><span class="color-box meeting"></span> Meeting Effort</span>
          </div>
        </div>

        <div class="dwpts-card">
          <div class="card-header">
            <div>
              <h3>Category Distribution (Month)</h3>
              <span class="subtitle">Effort by Task Category</span>
            </div>
          </div>

          <div class="category-list">
            <div class="cat-item" *ngFor="let c of data.categoryDistribution">
              <div class="cat-info">
                <span class="cat-name">{{ c.categoryName }}</span>
                <span class="cat-hours">{{ c.totalHours }}h ({{ c.percentage }}%)</span>
              </div>
              <div class="progress-track">
                <div class="progress-bar" [style.width.%]="c.percentage" [style.background]="c.colorCode || '#60A5FA'"></div>
              </div>
            </div>
            <div class="empty-state" *ngIf="data.categoryDistribution.length === 0">
              No effort logged this month yet.
            </div>
          </div>
        </div>
      </div>

      <!-- Today's Tasks -->
      <div class="dwpts-card">
        <div class="card-header">
          <div>
            <h3>Today's Work Entries</h3>
            <span class="subtitle">Active tasks recorded for today</span>
          </div>
          <a routerLink="/daily-work" class="btn btn-primary btn-sm btn-pill">+ Manage Daily Work</a>
        </div>

        <div class="dwpts-table-container">
          <table class="dwpts-table">
            <thead>
              <tr>
                <th>TASK #</th>
                <th>DESCRIPTION</th>
                <th>CATEGORY</th>
                <th>MEETING</th>
                <th>MEETING (H)</th>
                <th>WORK (H)</th>
                <th>TOTAL (H)</th>
                <th>STATUS</th>
                <th>REMARKS</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let e of data.todayEntries">
                <td><span class="mono-badge">{{ e.taskNumber || '-' }}</span></td>
                <td><strong>{{ e.description }}</strong></td>
                <td><span class="badge" [style.background]="(e.categoryColor || '#3B82F6') + '20'" [style.color]="e.categoryColor || '#60A5FA'">{{ e.categoryName || 'General' }}</span></td>
                <td>{{ e.meetingName || '-' }}</td>
                <td>{{ e.meetingEffortHours }}h</td>
                <td>{{ e.workEffortHours }}h</td>
                <td><strong>{{ e.totalEffortHours }}h</strong></td>
                <td><span class="badge status-completed">{{ e.status }}</span></td>
                <td>{{ e.remarks || '-' }}</td>
              </tr>
              <tr *ngIf="data.todayEntries.length === 0">
                <td colspan="9" style="text-align: center; color: var(--text-muted); padding: 28px;">No work entries planned or recorded for today yet.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Manager Team Capacity Section -->
      <div class="dwpts-card" *ngIf="auth.hasAnyRole(['ADMIN', 'MANAGER']) && data.teamSummary">
        <div class="card-header">
          <div>
            <h3>Team Capacity & Productivity Monitoring</h3>
            <span class="subtitle">{{ data.teamSummary.totalMembers }} Active Team Members</span>
          </div>
        </div>

        <div class="dwpts-table-container">
          <table class="dwpts-table">
            <thead>
              <tr>
                <th>TEAM MEMBER</th>
                <th>PLANNED</th>
                <th>MEETING HOURS</th>
                <th>WORK HOURS</th>
                <th>TOTAL ACTUAL</th>
                <th>UTILIZATION</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let m of data.teamSummary.memberUtilizations">
                <td><strong>{{ m.employeeName }}</strong></td>
                <td>{{ m.plannedHours }}h</td>
                <td>{{ m.meetingHours }}h</td>
                <td>{{ m.workHours }}h</td>
                <td><strong>{{ m.actualHours }}h</strong></td>
                <td>
                  <span class="badge" [ngClass]="{'status-completed': m.utilizationPercentage >= 90, 'status-ongoing': m.utilizationPercentage < 90 && m.utilizationPercentage > 0, 'status-holiday': m.utilizationPercentage === 0}">
                    {{ m.utilizationPercentage }}%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-title-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
    .date-badge-pill { background: #101E33; border: 1px solid var(--border-primary); padding: 6px 14px; border-radius: var(--radius-pill); font-weight: 700; font-size: 13px; color: var(--gold-highlight); box-shadow: var(--shadow-sm); }
    .kpi-grid-5 { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; margin-bottom: 24px; }
    .kpi-card { background: #101E33; border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 18px; display: flex; flex-direction: column; box-shadow: var(--shadow-card); transition: var(--transition-smooth); }
    .kpi-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-card-hover); border-color: rgba(214, 179, 106, 0.25); }
    .kpi-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
    .kpi-label { font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
    .kpi-icon { font-size: 14px; }
    .kpi-value { font-size: 24px; font-weight: 800; color: #F8FAFC; margin-top: 4px; letter-spacing: -0.02em; }
    .kpi-sub { font-size: 11.5px; color: var(--text-secondary); margin-top: 2px; }
    .kpi-gold .kpi-value { color: var(--gold-highlight); }

    .analytics-grid { display: grid; grid-template-columns: 1.4fr 1fr; gap: 24px; margin-bottom: 24px; }
    .trend-bars { display: flex; align-items: flex-end; justify-content: space-between; height: 180px; padding: 10px 0; border-bottom: 1px solid var(--border-primary); }
    .bar-col { display: flex; flex-direction: column; align-items: center; gap: 6px; flex: 1; height: 100%; justify-content: flex-end; }
    .stacked-bar { width: 28px; height: 120px; background: #0B1728; border-radius: 4px; display: flex; flex-direction: column-reverse; overflow: hidden; }
    .work-bar { background: #60A5FA; width: 100%; transition: height 0.3s; }
    .meeting-bar { background: #A78BFA; width: 100%; transition: height 0.3s; }
    .bar-val { font-size: 10.5px; font-weight: 700; color: var(--text-platinum); }
    .bar-label { font-size: 10.5px; color: var(--text-muted); white-space: nowrap; }
    .bar-legend { display: flex; gap: 16px; margin-top: 14px; font-size: 12px; font-weight: 600; color: var(--text-secondary); }
    .legend-item { display: flex; align-items: center; gap: 6px; }
    .color-box { width: 12px; height: 12px; border-radius: 3px; }
    .color-box.work { background: #60A5FA; }
    .color-box.meeting { background: #A78BFA; }

    .category-list { display: flex; flex-direction: column; gap: 12px; }
    .cat-info { display: flex; justify-content: space-between; font-size: 12.5px; font-weight: 600; margin-bottom: 4px; }
    .progress-track { height: 8px; background: #0B1728; border-radius: var(--radius-pill); overflow: hidden; }
    .progress-bar { height: 100%; border-radius: var(--radius-pill); }
    .empty-state { text-align: center; color: var(--text-muted); padding: 20px; font-size: 13px; }

    @media (max-width: 1024px) {
      .kpi-grid-5 { grid-template-columns: repeat(2, 1fr); }
      .analytics-grid { grid-template-columns: 1fr; }
    }

    @media (max-width: 768px) {
      .page-title-row { flex-direction: column; align-items: flex-start; gap: 8px; }
      .trend-bars { overflow-x: auto; -webkit-overflow-scrolling: touch; padding-bottom: 6px; }
      .bar-col { min-width: 36px; }
    }

    @media (max-width: 480px) {
      .kpi-grid-5 { grid-template-columns: 1fr; }
      .bar-legend { flex-wrap: wrap; gap: 8px; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  data: DashboardSummary = {
    date: new Date().toISOString().substring(0, 10),
    capacityHours: 8.0,
    plannedHours: 8.0,
    actualHours: 8.0,
    meetingHours: 0.0,
    workHours: 8.0,
    remainingHours: 0.0,
    overtimeHours: 0.0,
    utilizationPercentage: 100,
    weeklyActualHours: 40.0,
    monthlyActualHours: 160.0,
    todayEntries: [
      {
        workEntryId: 1,
        employeeId: 1,
        workDate: new Date().toISOString().substring(0, 10),
        taskNumber: '358112',
        description: 'Task 358112: Dev : Password Reset requirement in User Account utility',
        categoryId: 1,
        categoryName: 'Development',
        categoryColor: '#60A5FA',
        meetingEffortHours: 0,
        workEffortHours: 8,
        totalEffortHours: 8,
        plannedEffortHours: 8,
        varianceHours: 0,
        status: 'In Progress',
        remarks: 'Initial implementation and self-tested',
        createdAt: new Date().toISOString()
      }
    ],
    dailyEffortTrend: [
      { label: 'Mon', workHours: 7, meetingHours: 1, totalHours: 8, plannedHours: 8, capacityHours: 8 },
      { label: 'Tue', workHours: 6, meetingHours: 2, totalHours: 8, plannedHours: 8, capacityHours: 8 },
      { label: 'Wed', workHours: 8, meetingHours: 0, totalHours: 8, plannedHours: 8, capacityHours: 8 },
      { label: 'Thu', workHours: 8, meetingHours: 0, totalHours: 8, plannedHours: 8, capacityHours: 8 },
      { label: 'Fri', workHours: 7, meetingHours: 1, totalHours: 8, plannedHours: 8, capacityHours: 8 }
    ],
    categoryDistribution: [
      { categoryName: 'Development', colorCode: '#60A5FA', totalHours: 32, percentage: 80 },
      { categoryName: 'Discussion', colorCode: '#A78BFA', totalHours: 8, percentage: 20 }
    ],
    meetingDistribution: [],
    teamSummary: {
      totalMembers: 3,
      totalCapacity: 24,
      totalPlanned: 24,
      totalActual: 24,
      totalMeetings: 2,
      totalOvertime: 0,
      averageUtilization: 100,
      memberUtilizations: [
        { employeeId: 1, employeeName: 'Admin User', plannedHours: 8, actualHours: 8, meetingHours: 0, workHours: 8, utilizationPercentage: 100 },
        { employeeId: 2, employeeName: 'Manager User', plannedHours: 8, actualHours: 8, meetingHours: 1, workHours: 7, utilizationPercentage: 100 },
        { employeeId: 3, employeeName: 'Employee User', plannedHours: 8, actualHours: 8, meetingHours: 1, workHours: 7, utilizationPercentage: 100 }
      ]
    }
  };

  constructor(private api: ApiService, public auth: AuthService, private signalR: SignalRService) {}

  ngOnInit() {
    this.api.getDashboard().subscribe(res => {
      if (res.success && res.data) {
        this.data = res.data;
      }
    });
  }
}
