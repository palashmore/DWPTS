import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { DashboardSummary } from '../../core/models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-page animate-fade-in" *ngIf="data">
      <!-- 1. Executive Hero Header -->
      <div class="executive-header">
        <div class="header-left">
          <div class="badge-tag">
            <span class="pulse-dot"></span>
            <span>EXECUTIVE INTELLIGENCE COMMAND</span>
          </div>
          <h2>Operational Command Center</h2>
          <p class="subtitle">Real-time productivity telemetry, capacity allocation & engineering velocity</p>
        </div>

        <div class="header-right">
          <div class="date-widget">
            <span class="calendar-icon">📅</span>
            <div class="date-text">
              <span class="day-name">{{ todayDayName }}</span>
              <span class="full-date">{{ data.date | date:'mediumDate' }}</span>
            </div>
          </div>
          <div class="action-btn-group">
            <button class="btn btn-secondary btn-sm" (click)="goToDailyWork()">+ Add Work Entry</button>
            <button class="btn btn-primary btn-sm cta-glow" routerLink="/daily-work">⚡ Open Daily Work</button>
          </div>
        </div>
      </div>

      <!-- 2. Top 5 Glassmorphic Metric Cards -->
      <div class="metrics-deck">
        <!-- Metric 1: Today's Effort -->
        <div class="metric-card gold-glow">
          <div class="metric-top">
            <span class="metric-title">TODAY'S LOGGED EFFORT</span>
            <span class="metric-badge-icon">⚡</span>
          </div>
          <div class="metric-value-row">
            <span class="big-val">{{ data.actualHours }}<span class="unit">h</span></span>
            <span class="target-val">/ {{ data.capacityHours }}h limit</span>
          </div>
          <div class="progress-track-mini">
            <div class="progress-fill-gold" [style.width.%]="getProgressPercent(data.actualHours, data.capacityHours)"></div>
          </div>
          <div class="metric-footer">
            <span *ngIf="data.remainingHours > 0">⏱️ {{ data.remainingHours }}h Available</span>
            <span *ngIf="data.remainingHours === 0" style="color: #34D399;">✨ Capacity Fulfilled</span>
            <span>Planned: {{ data.plannedHours }}h</span>
          </div>
        </div>

        <!-- Metric 2: Deep Work vs Meetings -->
        <div class="metric-card">
          <div class="metric-top">
            <span class="metric-title">DEEP WORK VS MEETINGS</span>
            <span class="metric-badge-icon">👥</span>
          </div>
          <div class="metric-value-row">
            <span class="big-val text-blue">{{ data.workHours }}<span class="unit">h</span></span>
            <span class="split-slash">/</span>
            <span class="big-val text-purple">{{ data.meetingHours }}<span class="unit">h</span></span>
          </div>
          <div class="split-track-mini">
            <div class="split-work-bar" [style.width.%]="getWorkRatio()"></div>
            <div class="split-meeting-bar" [style.width.%]="getMeetingRatio()"></div>
          </div>
          <div class="metric-footer">
            <span class="text-blue">⚡ Work: {{ getWorkRatio() }}%</span>
            <span class="text-purple">🟣 Meetings: {{ getMeetingRatio() }}%</span>
          </div>
        </div>

        <!-- Metric 3: Utilization Status -->
        <div class="metric-card" [ngClass]="{'optimal-glow': data.utilizationPercentage >= 80 && data.utilizationPercentage <= 110, 'under-glow': data.utilizationPercentage < 80, 'over-glow': data.utilizationPercentage > 110}">
          <div class="metric-top">
            <span class="metric-title">UTILIZATION STATUS</span>
            <span class="metric-badge-icon">🚀</span>
          </div>
          <div class="metric-value-row">
            <span class="big-val">{{ data.utilizationPercentage }}<span class="unit">%</span></span>
            <span class="status-pill" [ngClass]="{'pill-optimal': data.utilizationPercentage >= 80 && data.utilizationPercentage <= 110, 'pill-under': data.utilizationPercentage < 80, 'pill-over': data.utilizationPercentage > 110}">
              {{ getUtilizationLabel() }}
            </span>
          </div>
          <div class="progress-track-mini">
            <div class="progress-fill-hero" [style.width.%]="data.utilizationPercentage > 100 ? 100 : data.utilizationPercentage"></div>
          </div>
          <div class="metric-footer">
            <span>{{ data.overtimeHours > 0 ? '+' + data.overtimeHours + 'h Overtime' : (data.remainingHours === 0 ? 'Optimal (0h Left)' : data.remainingHours + 'h Remaining') }}</span>
            <span>Target: 100%</span>
          </div>
        </div>

        <!-- Metric 4: Monthly & Weekly Velocity -->
        <div class="metric-card">
          <div class="metric-top">
            <span class="metric-title">MONTHLY VELOCITY</span>
            <span class="metric-badge-icon">📈</span>
          </div>
          <div class="metric-value-row">
            <span class="big-val text-emerald">{{ data.monthlyActualHours }}<span class="unit">h</span></span>
            <span class="target-val">This Month</span>
          </div>
          <div class="progress-track-mini">
            <div class="progress-fill-emerald" [style.width.%]="Math.min(100, (data.monthlyActualHours / 160) * 100)"></div>
          </div>
          <div class="metric-footer">
            <span>Week Total: <strong>{{ data.weeklyActualHours }}h</strong></span>
            <span style="color: #34D399;">Active Month</span>
          </div>
        </div>

        <!-- Metric 5: Leave & Time-Off Balance -->
        <div class="metric-card clickable-card" routerLink="/leaves">
          <div class="metric-top">
            <span class="metric-title">LEAVE QUOTA BALANCE</span>
            <span class="metric-badge-icon">🏖️</span>
          </div>
          <div class="metric-value-row">
            <span class="big-val text-gold">44 <span class="unit" style="font-size: 14px;">EL Days</span></span>
          </div>
          <div class="progress-track-mini">
            <div class="progress-fill-gold" style="width: 100%;"></div>
          </div>
          <div class="metric-footer">
            <span>CL: <strong>12</strong> | SL: <strong>10</strong></span>
            <span class="link-arrow">View Quota →</span>
          </div>
        </div>
      </div>

      <!-- 3. Mid Grid: 7-Day Velocity Studio (60%) + Category Breakdown & AI Insights (40%) -->
      <div class="mid-analytics-grid">
        <!-- 7-Day Velocity Studio -->
        <div class="dwpts-card studio-card">
          <div class="card-header flex-between">
            <div>
              <h3>7-Day Engineering & Meeting Velocity</h3>
              <span class="subtitle">Daily Work & Meeting effort trajectory across this week</span>
            </div>
            <div class="bar-legend">
              <span class="legend-item"><span class="color-dot work-dot"></span> Work</span>
              <span class="legend-item"><span class="color-dot meeting-dot"></span> Meetings</span>
              <span class="legend-item"><span class="cap-line-dot"></span> 8h Target</span>
            </div>
          </div>

          <div class="trend-visual-container">
            <div class="target-benchmark-line" title="Standard 8h Capacity Target">
              <span class="benchmark-tag">8h Target</span>
            </div>

            <div class="trend-bars-deck">
              <div class="bar-column" *ngFor="let item of data.dailyEffortTrend" (click)="openDateInDailyWork(item.label)">
                <div class="bar-top-hours" [ngClass]="{'has-hours': item.totalHours > 0}">{{ item.totalHours }}h</div>
                <div class="stacked-bar-track">
                  <div class="stacked-meeting-fill" [style.height.%]="(item.meetingHours / 10) * 100" [title]="'Meetings: ' + item.meetingHours + 'h'"></div>
                  <div class="stacked-work-fill" [style.height.%]="(item.workHours / 10) * 100" [title]="'Work: ' + item.workHours + 'h'"></div>
                </div>
                <div class="bar-day-label">
                  {{ item.label }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Side: Category Mix + AI Intelligence -->
        <div class="right-panel-stack">
          <!-- Category Allocation Card -->
          <div class="dwpts-card">
            <div class="card-header">
              <div>
                <h3>Category Effort Mix</h3>
                <span class="subtitle">Distribution across engineering and discussions</span>
              </div>
            </div>

            <div class="category-breakdown-list">
              <div class="category-row" *ngFor="let c of data.categoryDistribution">
                <div class="cat-meta">
                  <div class="cat-name-box">
                    <span class="cat-bullet" [style.background]="c.colorCode || '#60A5FA'"></span>
                    <span class="cat-label">{{ c.categoryName }}</span>
                  </div>
                  <div class="cat-values">
                    <span class="cat-hrs">{{ c.totalHours }}h</span>
                    <span class="cat-pct">{{ c.percentage }}%</span>
                  </div>
                </div>
                <div class="progress-bar-bg">
                  <div class="progress-bar-fill" [style.width.%]="c.percentage" [style.background]="c.colorCode || '#60A5FA'"></div>
                </div>
              </div>

              <div class="empty-category-notice" *ngIf="data.categoryDistribution.length === 0">
                <span>⚡ No categorized tasks logged yet. Start logging in Daily Work.</span>
              </div>
            </div>
          </div>

          <!-- AI Productivity Intelligence -->
          <div class="dwpts-card ai-insight-card">
            <div class="card-header flex-between">
              <div class="ai-title-group">
                <span class="ai-badge-icon">🤖</span>
                <div>
                  <h3>AI Operational Insights</h3>
                  <span class="subtitle">Autonomous capacity & meeting health telemetry</span>
                </div>
              </div>
            </div>

            <div class="ai-insights-body">
              <div class="insight-item">
                <span class="insight-bullet">💡</span>
                <p><strong>Today's Focus:</strong> You have logged <strong>{{ data.actualHours }}h</strong> out of <strong>{{ data.capacityHours }}h</strong>. {{ data.remainingHours > 0 ? (data.remainingHours + 'h remaining for deep work.') : 'Daily capacity is perfectly fulfilled.' }}</p>
              </div>
              <div class="insight-item">
                <span class="insight-bullet">🎯</span>
                <p><strong>Meeting Ratio:</strong> Meetings account for <strong>{{ getMeetingRatio() }}%</strong> of your effort today. {{ getMeetingRatio() <= 25 ? 'Meeting overhead is well-balanced.' : 'High meeting load detected today.' }}</p>
              </div>
              <div class="insight-item">
                <span class="insight-bullet">🌴</span>
                <p><strong>Upcoming Holiday:</strong> <strong>Ganesh Chaturthi</strong> is on <strong>Monday, 14-Sep-2026</strong> (Compulsory Paid Holiday).</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 4. Today's Live Work Entries Deck -->
      <div class="dwpts-card table-card">
        <div class="card-header flex-between">
          <div>
            <h3>Today's Work Entries ({{ data.todayEntries.length }})</h3>
            <span class="subtitle">Live active tasks, meeting durations, and progress records for today</span>
          </div>
          <div class="header-table-actions">
            <button class="btn btn-primary btn-sm btn-pill cta-glow" routerLink="/daily-work">+ Manage Daily Work</button>
          </div>
        </div>

        <div class="dwpts-table-container">
          <table class="dwpts-table">
            <thead>
              <tr>
                <th style="width: 100px;">TASK #</th>
                <th>DESCRIPTION</th>
                <th style="width: 130px;">CATEGORY</th>
                <th style="width: 160px;">MEETING</th>
                <th style="text-align: right; width: 90px;">MEETING (H)</th>
                <th style="text-align: right; width: 90px;">WORK (H)</th>
                <th style="text-align: right; width: 90px;">TOTAL (H)</th>
                <th style="width: 110px;">STATUS</th>
                <th>REMARKS</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let e of data.todayEntries">
                <td><span class="task-code-pill">{{ e.taskNumber || '-' }}</span></td>
                <td><strong class="task-desc-text">{{ e.description }}</strong></td>
                <td>
                  <span class="category-chip" [style.background]="(e.categoryColor || '#3B82F6') + '22'" [style.color]="e.categoryColor || '#60A5FA'" [style.border-color]="(e.categoryColor || '#3B82F6') + '55'">
                    {{ e.categoryName || 'General' }}
                  </span>
                </td>
                <td>
                  <span class="meeting-tag" *ngIf="e.meetingName">👥 {{ e.meetingName }}</span>
                  <span *ngIf="!e.meetingName" style="color: var(--text-muted);">-</span>
                </td>
                <td style="text-align: right; font-weight: 700; color: #C084FC;">{{ e.meetingEffortHours || 0 }}h</td>
                <td style="text-align: right; font-weight: 700; color: #60A5FA;">{{ e.workEffortHours || 0 }}h</td>
                <td style="text-align: right; font-weight: 800; color: var(--text-gold);">{{ e.totalEffortHours || 0 }}h</td>
                <td>
                  <span class="badge" [ngClass]="{'status-completed': e.status === 'Completed', 'status-inprogress': e.status === 'In Progress', 'status-warning': e.status === 'On Hold'}">
                    {{ e.status }}
                  </span>
                </td>
                <td><span class="remarks-cell">{{ e.remarks || '-' }}</span></td>
              </tr>

              <tr *ngIf="data.todayEntries.length === 0">
                <td colspan="9" class="empty-table-cell">
                  <div class="empty-state-box">
                    <div class="empty-icon">📝</div>
                    <h4>No Work Entries Logged for Today Yet</h4>
                    <p>Start your day by logging tasks or standup meetings to track your 8h daily capacity.</p>
                    <div class="empty-btn-row">
                      <button class="btn btn-primary btn-sm cta-glow" routerLink="/daily-work">+ Open Daily Work Planner</button>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-page {
      display: flex;
      flex-direction: column;
      gap: 22px;
      padding-bottom: 30px;
    }

    /* Executive Hero Header */
    .executive-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.75));
      border: 1px solid var(--border-gold-subtle);
      border-radius: var(--radius-xl);
      padding: 20px 24px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      backdrop-filter: blur(10px);
    }
    .badge-tag {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 10.5px;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: var(--text-gold);
      margin-bottom: 6px;
    }
    .pulse-dot {
      width: 7px;
      height: 7px;
      background: var(--gold-primary);
      border-radius: 50%;
      box-shadow: 0 0 8px var(--gold-primary);
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0% { transform: scale(0.95); opacity: 0.8; }
      50% { transform: scale(1.3); opacity: 1; }
      100% { transform: scale(0.95); opacity: 0.8; }
    }
    .executive-header h2 {
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: #fff;
      margin: 0;
    }
    .subtitle {
      font-size: 12.5px;
      color: var(--text-muted);
      margin-top: 4px;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .date-widget {
      display: flex;
      align-items: center;
      gap: 10px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      padding: 8px 14px;
      border-radius: var(--radius-lg);
    }
    .calendar-icon { font-size: 20px; }
    .date-text { display: flex; flex-direction: column; }
    .day-name { font-size: 13px; font-weight: 800; color: #fff; }
    .full-date { font-size: 11px; color: var(--text-muted); }
    .action-btn-group { display: flex; gap: 8px; }

    /* 5 KPI Metric Cards Deck */
    .metrics-deck {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 14px;
    }
    .metric-card {
      background: var(--bg-card);
      border: 1px solid var(--border-gold-subtle);
      border-radius: var(--radius-lg);
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      box-shadow: var(--shadow-sm);
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .metric-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 24px rgba(0,0,0,0.4);
      border-color: rgba(212, 175, 55, 0.35);
    }
    .gold-glow { border-left: 4px solid var(--gold-primary); }
    .optimal-glow { border-left: 4px solid #34D399; }
    .under-glow { border-left: 4px solid #60A5FA; }
    .over-glow { border-left: 4px solid #F87171; }
    .clickable-card { cursor: pointer; border-left: 4px solid #F59E0B; }

    .metric-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .metric-title {
      font-size: 10.5px;
      font-weight: 800;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      text-transform: uppercase;
    }
    .metric-badge-icon { font-size: 14px; }

    .metric-value-row {
      display: flex;
      align-items: baseline;
      gap: 8px;
    }
    .big-val {
      font-size: 24px;
      font-weight: 800;
      color: #fff;
      letter-spacing: -0.02em;
    }
    .big-val.text-gold { color: var(--text-gold); }
    .big-val.text-blue { color: #60A5FA; }
    .big-val.text-purple { color: #C084FC; }
    .big-val.text-emerald { color: #34D399; }
    .unit { font-size: 14px; font-weight: 700; color: var(--text-muted); margin-left: 1px; }
    .target-val { font-size: 12px; color: var(--text-muted); font-weight: 600; }
    .split-slash { font-size: 18px; color: rgba(255,255,255,0.2); }

    .progress-track-mini {
      width: 100%;
      height: 5px;
      background: rgba(255, 255, 255, 0.06);
      border-radius: 999px;
      overflow: hidden;
    }
    .progress-fill-gold { height: 100%; background: linear-gradient(90deg, #D4AF37, #FBBF24); border-radius: 999px; }
    .progress-fill-hero { height: 100%; background: linear-gradient(90deg, #3B82F6, #10B981); border-radius: 999px; }
    .progress-fill-emerald { height: 100%; background: linear-gradient(90deg, #059669, #34D399); border-radius: 999px; }

    .split-track-mini {
      width: 100%;
      height: 5px;
      background: rgba(255, 255, 255, 0.06);
      border-radius: 999px;
      display: flex;
      overflow: hidden;
    }
    .split-work-bar { height: 100%; background: #3B82F6; }
    .split-meeting-bar { height: 100%; background: #A855F7; }

    .status-pill {
      font-size: 10px;
      font-weight: 800;
      padding: 2px 8px;
      border-radius: var(--radius-pill);
      text-transform: uppercase;
    }
    .pill-optimal { background: rgba(52, 211, 153, 0.15); color: #34D399; border: 1px solid rgba(52, 211, 153, 0.3); }
    .pill-under { background: rgba(96, 165, 250, 0.15); color: #60A5FA; border: 1px solid rgba(96, 165, 250, 0.3); }
    .pill-over { background: rgba(248, 113, 113, 0.15); color: #F87171; border: 1px solid rgba(248, 113, 113, 0.3); }

    .metric-footer {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: var(--text-muted);
      border-top: 1px solid rgba(255,255,255,0.05);
      padding-top: 6px;
    }
    .link-arrow { color: var(--text-gold); font-weight: 700; }

    /* Mid Grid: Studio (60%) + Right Stack (40%) */
    .mid-analytics-grid {
      display: grid;
      grid-template-columns: 1.4fr 1fr;
      gap: 18px;
    }
    .flex-between { display: flex; justify-content: space-between; align-items: center; }

    .bar-legend {
      display: flex;
      align-items: center;
      gap: 14px;
      font-size: 11.5px;
      color: var(--text-muted);
    }
    .legend-item { display: flex; align-items: center; gap: 6px; }
    .color-dot { width: 8px; height: 8px; border-radius: 2px; }
    .work-dot { background: #3B82F6; }
    .meeting-dot { background: #A855F7; }
    .cap-line-dot { width: 12px; height: 2px; background: rgba(212, 175, 55, 0.7); }

    .trend-visual-container {
      position: relative;
      padding-top: 30px;
      height: 220px;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
    }
    .target-benchmark-line {
      position: absolute;
      top: 60px;
      left: 0;
      right: 0;
      border-top: 1px dashed rgba(212, 175, 55, 0.4);
      z-index: 1;
      pointer-events: none;
    }
    .benchmark-tag {
      position: absolute;
      right: 0;
      top: -10px;
      font-size: 9.5px;
      font-weight: 800;
      color: var(--text-gold);
      background: rgba(17, 24, 39, 0.9);
      padding: 1px 6px;
      border-radius: 4px;
      border: 1px solid rgba(212, 175, 55, 0.3);
    }

    .trend-bars-deck {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      height: 180px;
      z-index: 2;
      padding: 0 10px;
    }
    .bar-column {
      flex: 1;
      max-width: 46px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      transition: transform 0.2s ease;
    }
    .bar-column:hover { transform: scale(1.06); }

    .bar-top-hours {
      font-size: 11px;
      font-weight: 800;
      color: var(--text-muted);
      min-height: 16px;
    }
    .bar-top-hours.has-hours { color: #fff; }

    .stacked-bar-track {
      width: 24px;
      height: 130px;
      background: rgba(255, 255, 255, 0.04);
      border-radius: 6px;
      display: flex;
      flex-direction: column-reverse;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.06);
    }
    .stacked-work-fill {
      width: 100%;
      background: linear-gradient(180deg, #3B82F6, #1D4ED8);
      transition: height 0.4s ease;
    }
    .stacked-meeting-fill {
      width: 100%;
      background: linear-gradient(180deg, #C084FC, #9333EA);
      transition: height 0.4s ease;
    }

    .bar-day-label {
      font-size: 11px;
      font-weight: 700;
      color: var(--text-muted);
    }

    /* Right Stack */
    .right-panel-stack {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }
    .category-breakdown-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .category-row { display: flex; flex-direction: column; gap: 4px; }
    .cat-meta { display: flex; justify-content: space-between; align-items: center; }
    .cat-name-box { display: flex; align-items: center; gap: 8px; }
    .cat-bullet { width: 8px; height: 8px; border-radius: 50%; }
    .cat-label { font-size: 12px; font-weight: 700; color: #fff; }
    .cat-values { display: flex; gap: 8px; font-size: 11.5px; }
    .cat-hrs { font-weight: 700; color: var(--text-gold); }
    .cat-pct { color: var(--text-muted); }
    .progress-bar-bg {
      width: 100%;
      height: 6px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 999px;
      overflow: hidden;
    }
    .progress-bar-fill { height: 100%; border-radius: 999px; }
    .empty-category-notice { font-size: 12px; color: var(--text-muted); padding: 10px 0; }

    /* AI Insight Card */
    .ai-insight-card {
      background: linear-gradient(135deg, rgba(17, 24, 39, 0.95), rgba(30, 27, 75, 0.35));
      border: 1px solid rgba(168, 85, 247, 0.25);
    }
    .ai-title-group { display: flex; align-items: center; gap: 10px; }
    .ai-badge-icon { font-size: 20px; }
    .ai-insights-body { display: flex; flex-direction: column; gap: 10px; }
    .insight-item {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      font-size: 12px;
      line-height: 1.45;
      color: #cbd5e1;
    }
    .insight-bullet { font-size: 14px; }

    /* Table & Empty State */
    .task-code-pill {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 700;
      background: rgba(255, 255, 255, 0.06);
      padding: 3px 8px;
      border-radius: 4px;
      color: #94a3b8;
    }
    .task-desc-text { font-size: 13px; color: #fff; }
    .category-chip {
      display: inline-block;
      font-size: 11px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: var(--radius-pill);
      border: 1px solid;
    }
    .meeting-tag {
      font-size: 11px;
      color: #C084FC;
      background: rgba(168, 85, 247, 0.1);
      border: 1px solid rgba(168, 85, 247, 0.25);
      padding: 2px 7px;
      border-radius: 4px;
    }
    .remarks-cell { font-size: 12px; color: var(--text-muted); }

    .empty-table-cell {
      text-align: center;
      padding: 36px 20px !important;
    }
    .empty-state-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      max-width: 400px;
      margin: 0 auto;
    }
    .empty-icon { font-size: 32px; }
    .empty-state-box h4 { font-size: 15px; font-weight: 800; color: #fff; margin: 0; }
    .empty-state-box p { font-size: 12px; color: var(--text-muted); margin: 0; }
    .empty-btn-row { margin-top: 8px; }

    @media (max-width: 1200px) {
      .metrics-deck { grid-template-columns: repeat(3, 1fr); }
      .mid-analytics-grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 768px) {
      .metrics-deck { grid-template-columns: 1fr; }
      .executive-header { flex-direction: column; gap: 16px; align-items: flex-start; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  data: DashboardSummary | null = null;
  Math = Math;

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadDashboard();
  }

  get todayDayName(): string {
    return new Date().toLocaleDateString('en-US', { weekday: 'long' });
  }

  loadDashboard() {
    const today = new Date().toISOString().substring(0, 10);
    this.api.getDashboard(today).subscribe({
      next: (res: any) => {
        if (res && res.success && res.data) {
          this.data = res.data;
        }
      },
      error: () => {}
    });
  }

  getProgressPercent(val: number, max: number): number {
    if (!max || max <= 0) return 0;
    return Math.min(100, Math.round((val / max) * 100));
  }

  getWorkRatio(): number {
    if (!this.data) return 0;
    const total = (this.data.workHours || 0) + (this.data.meetingHours || 0);
    if (total === 0) return 0;
    return Math.round(((this.data.workHours || 0) / total) * 100);
  }

  getMeetingRatio(): number {
    if (!this.data) return 0;
    const total = (this.data.workHours || 0) + (this.data.meetingHours || 0);
    if (total === 0) return 0;
    return Math.round(((this.data.meetingHours || 0) / total) * 100);
  }

  getUtilizationLabel(): string {
    if (!this.data) return 'Optimal';
    if (this.data.utilizationPercentage >= 80 && this.data.utilizationPercentage <= 110) return 'Optimal';
    if (this.data.utilizationPercentage < 80) return 'Under';
    return 'Overtime';
  }

  openDateInDailyWork(dayLabel: string) {
    this.router.navigate(['/daily-work']);
  }

  goToDailyWork() {
    this.router.navigate(['/daily-work']);
  }
}
