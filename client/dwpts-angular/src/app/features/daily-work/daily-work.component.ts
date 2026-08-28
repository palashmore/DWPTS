import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { DailyWorkScreen, WorkEntry, Category, Meeting } from '../../core/models/models';

@Component({
  selector: 'app-daily-work',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="daily-work-page">
      <!-- Floating Luxury Toast Notification -->
      <div class="toast-notification" *ngIf="toastMessage" [ngClass]="toastType">
        <span class="toast-icon">{{ toastType === 'success' ? '✅' : (toastType === 'error' ? '❌' : 'ℹ️') }}</span>
        <div class="toast-content">
          <span class="toast-title">{{ toastType === 'success' ? 'Command Executed' : 'Notice' }}</span>
          <span class="toast-text">{{ toastMessage }}</span>
        </div>
      </div>

      <!-- Page Header Bar -->
      <div class="page-header-bar">
        <div>
          <h2>Daily Work</h2>
          <p class="subtitle">Multi-task planning, meeting tracking and progress history</p>
        </div>
        <div class="header-right-status">
          <span class="status-pill-synced">
            <span class="dot-pulse"></span>
            Operational Command Synced
          </span>
        </div>
      </div>

      <!-- 1. Top Segmented Date Navigation & Action Bar -->
      <div class="dwpts-card date-hero-card">
        <div class="date-navigator-pill">
          <button class="nav-arrow-btn" (click)="changeDay(-1)" title="Previous Day">
            <span>‹</span>
          </button>
          <div class="date-display-box">
            <input type="date" [ngModel]="selectedDate" (ngModelChange)="onDateChange($event)" class="date-picker-input" />
            <span class="day-badge">{{ screenData?.dayName || getDayName(selectedDate) }}</span>
          </div>
          <button class="nav-arrow-btn" (click)="changeDay(1)" title="Next Day">
            <span>›</span>
          </button>
          <button class="today-pill-btn" [class.is-today]="isCurrentToday()" (click)="goToToday()">
            <span class="sparkle-dot"></span>
            Today
          </button>
        </div>

        <div class="hero-actions-group">
          <button class="btn btn-secondary btn-pill" (click)="copyPreviousDay()">
            <span class="btn-icon">📋</span>
            <span>Copy Previous Day</span>
          </button>
          <button class="btn btn-primary btn-pill cta-glow" (click)="openAddModal()">
            <span class="btn-icon">✨</span>
            <span>+ Add Work Entry</span>
          </button>
        </div>
      </div>

      <!-- 2. Single-Row Responsive KPI Cards Widget -->
      <div class="kpi-hero-container" *ngIf="screenData">
        <!-- Card 1: Capacity Limit -->
        <div class="metric-card">
          <div class="metric-header">
            <span class="metric-label">DAILY CAPACITY</span>
            <span class="metric-icon-bubble base">🎯</span>
          </div>
          <div class="metric-body">
            <span class="metric-value">{{ screenData.dailyCapacityHours }}<span class="metric-unit">h</span></span>
            <span class="metric-sub">Base Limit</span>
          </div>
          <div class="mini-progress-track">
            <div class="mini-progress-fill base" style="width: 100%"></div>
          </div>
        </div>

        <!-- Card 2: Planned vs Actual -->
        <div class="metric-card">
          <div class="metric-header">
            <span class="metric-label">PLANNED / ACTUAL</span>
            <span class="metric-icon-bubble plan">📊</span>
          </div>
          <div class="metric-body">
            <span class="metric-value">{{ screenData.totalActualHours }}<span class="metric-unit">h</span></span>
            <span class="metric-sub">Planned: {{ screenData.totalPlannedHours }}h</span>
          </div>
          <div class="mini-progress-track">
            <div class="mini-progress-fill plan" [style.width.%]="getProgressPercent(screenData.totalActualHours, screenData.totalPlannedHours || 8)"></div>
          </div>
        </div>

        <!-- Card 3: Work vs Meeting Split -->
        <div class="metric-card">
          <div class="metric-header">
            <span class="metric-label">WORK VS MEETING</span>
            <span class="metric-icon-bubble split">⚡</span>
          </div>
          <div class="metric-body">
            <span class="metric-value">{{ screenData.totalWorkHours }}<span class="metric-unit">h</span> <span class="split-divider">/</span> {{ screenData.totalMeetingHours }}<span class="metric-unit">h</span></span>
            <span class="metric-sub">Work: {{ getWorkPercent() }}% | Meetings: {{ getMeetingPercent() }}%</span>
          </div>
          <div class="split-progress-track">
            <div class="split-fill-work" [style.width.%]="getWorkPercent()"></div>
            <div class="split-fill-meeting" [style.width.%]="getMeetingPercent()"></div>
          </div>
        </div>

        <!-- Card 4: Utilization & Remaining Hero Badge -->
        <div class="metric-card highlight" [ngClass]="{'optimal': !screenData.isOverCapacity && screenData.utilizationPercentage >= 90, 'over': screenData.isOverCapacity, 'under': screenData.utilizationPercentage < 90}">
          <div class="metric-header">
            <span class="metric-label">UTILIZATION STATUS</span>
            <span class="metric-icon-bubble hero">🚀</span>
          </div>
          <div class="metric-body">
            <span class="metric-value hero-val">{{ screenData.utilizationPercentage }}<span class="metric-unit">%</span></span>
            <span class="status-glow-badge" [ngClass]="{'optimal': !screenData.isOverCapacity, 'over': screenData.isOverCapacity}">
              {{ screenData.isOverCapacity ? '+' + screenData.overtimeHours + 'h Overtime' : (screenData.remainingCapacityHours === 0 ? 'Optimal (0h left)' : screenData.remainingCapacityHours + 'h Remaining') }}
            </span>
          </div>
          <div class="mini-progress-track">
            <div class="mini-progress-fill hero-fill" [style.width.%]="screenData.utilizationPercentage > 100 ? 100 : screenData.utilizationPercentage"></div>
          </div>
        </div>
      </div>

      <!-- Main Layout: Left Data-Grid (70%) + Right Supporting Panel (30%) -->
      <div class="dashboard-split-layout">
        <!-- 3. Work Entries Table (Data-Grid) -->
        <div class="dwpts-card table-card">
          <div class="card-header table-header-flex">
            <div>
              <h3>Daily Work Entries ({{ screenData?.entries?.length || 0 }})</h3>
              <span class="subtitle">Multi-task planning, categorized efforts, and progress history</span>
            </div>
            <div class="table-header-actions" style="display: flex; gap: 8px;">
              <button class="btn btn-danger btn-sm btn-pill" *ngIf="screenData?.entries && screenData!.entries.length > 0" (click)="clearAllToday()" title="Clear all tasks for this day">
                <span>🗑️ Clear All ({{ screenData?.entries?.length }})</span>
              </button>
              <button class="btn btn-primary btn-sm btn-pill" (click)="openAddModal()">
                <span>+ Add Task</span>
              </button>
            </div>
          </div>

          <div class="dwpts-table-container">
            <table class="dwpts-table">
              <thead>
                <tr>
                  <th style="width: 100px;">TASK #</th>
                  <th>DESCRIPTION</th>
                  <th style="width: 130px;">CATEGORY</th>
                  <th style="width: 130px;">MEETING</th>
                  <th style="text-align: right; width: 85px;">PLANNED</th>
                  <th style="text-align: right; width: 85px;">MEETING</th>
                  <th style="text-align: right; width: 85px;">WORK</th>
                  <th style="text-align: right; width: 95px;">TOTAL</th>
                  <th style="text-align: right; width: 80px;">VARIANCE</th>
                  <th style="width: 110px;">STATUS</th>
                  <th>REMARKS</th>
                  <th style="text-align: center; width: 100px;">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let e of screenData?.entries" class="entry-row">
                  <td>
                    <span class="mono-badge">{{ e.taskNumber || '-' }}</span>
                  </td>
                  <td>
                    <div class="task-desc">{{ e.description }}</div>
                  </td>
                  <td>
                    <span class="category-capsule" [style.background]="(e.categoryColor || '#3B82F6') + '20'" [style.color]="e.categoryColor || '#60A5FA'" [style.borderColor]="(e.categoryColor || '#3B82F6') + '50'">
                      <span class="cat-dot" [style.background]="e.categoryColor || '#60A5FA'"></span>
                      {{ e.categoryName || 'Development' }}
                    </span>
                  </td>
                  <td>
                    <span class="meeting-text" *ngIf="e.meetingName">{{ e.meetingName }}</span>
                    <span class="muted-dash" *ngIf="!e.meetingName">-</span>
                  </td>
                  <td style="text-align: right;" class="metric-num">{{ e.plannedEffortHours }}h</td>
                  <td style="text-align: right;" class="metric-num">{{ e.meetingEffortHours }}h</td>
                  <td style="text-align: right;" class="metric-num">{{ e.workEffortHours }}h</td>
                  <td style="text-align: right;" class="metric-num-bold">
                    <span class="total-pill">{{ e.totalEffortHours }}h</span>
                  </td>
                  <td style="text-align: right;" [style.color]="e.varianceHours > 0 ? '#FBBF24' : (e.varianceHours < 0 ? '#60A5FA' : '#34D399')">
                    <strong>{{ e.varianceHours > 0 ? '+' + e.varianceHours : e.varianceHours }}h</strong>
                  </td>
                  <td>
                    <span class="badge" [ngClass]="{'status-completed': e.status === 'Completed' || e.status === 'Fixed', 'status-inprogress': e.status === 'In Progress' || e.status === 'Ongoing', 'status-warning': e.status === 'On Hold'}">
                      {{ e.status }}
                    </span>
                  </td>
                  <td>
                    <span class="remarks-text" title="{{ e.remarks }}">{{ e.remarks || '-' }}</span>
                  </td>
                  <td class="table-actions-cell">
                    <div class="action-btn-group">
                      <button class="action-btn edit" title="Edit Entry" (click)="openEditModal(e)">✏️</button>
                      <button class="action-btn copy" title="Duplicate Entry" (click)="duplicateEntry(e)">📑</button>
                      <button class="action-btn delete" title="Delete Entry" (click)="deleteEntry(e.workEntryId)">🗑️</button>
                    </div>
                  </td>
                </tr>
                <tr *ngIf="screenData?.entries?.length === 0">
                  <td colspan="12" class="empty-table-state">
                    <div class="empty-icon-bubble">📝</div>
                    <h4>No Work Entries Recorded</h4>
                    <p>There are no tasks logged for {{ selectedDate | date:'mediumDate' }}. Click <strong>"+ Add Work Entry"</strong> or <strong>"Copy Previous Day"</strong> above.</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 4. Right Supporting Panel (Calendar Glance & Quick Actions) -->
        <div class="supporting-sidebar-col">
          <!-- Today's Distribution Donut Summary -->
          <div class="dwpts-card side-summary-card" *ngIf="screenData">
            <div class="card-header">
              <h3>Today's Workload</h3>
              <span class="badge status-completed">{{ screenData.utilizationPercentage }}% Util</span>
            </div>

            <div class="donut-visual-container">
              <div class="donut-ring-graphic">
                <div class="ring-center-content">
                  <span class="ring-val">{{ screenData.totalActualHours }}h</span>
                  <span class="ring-lbl">Total Effort</span>
                </div>
              </div>
            </div>

            <div class="side-legend-list">
              <div class="legend-row">
                <span class="legend-indicator work"></span>
                <span class="legend-text">Development / Work</span>
                <span class="legend-val">{{ screenData.totalWorkHours }}h</span>
              </div>
              <div class="legend-row">
                <span class="legend-indicator meeting"></span>
                <span class="legend-text">Meetings & Syncs</span>
                <span class="legend-val">{{ screenData.totalMeetingHours }}h</span>
              </div>
              <div class="legend-row">
                <span class="legend-indicator cap"></span>
                <span class="legend-text">Remaining Capacity</span>
                <span class="legend-val">{{ screenData.remainingCapacityHours }}h</span>
              </div>
            </div>
          </div>

          <!-- Quick Navigation Actions Card -->
          <div class="dwpts-card quick-nav-card">
            <div class="card-header">
              <h3>Quick Actions</h3>
            </div>
            <div class="action-card-list">
              <a routerLink="/calendar" class="quick-action-link">
                <span class="action-ico">📅</span>
                <div class="action-info">
                  <span class="action-title">Monthly Calendar</span>
                  <span class="action-desc">View full monthly workload</span>
                </div>
                <span class="action-arrow">›</span>
              </a>
              <a routerLink="/reports" class="quick-action-link">
                <span class="action-ico">📑</span>
                <div class="action-info">
                  <span class="action-title">Executive Reports</span>
                  <span class="action-desc">Weekly & Yearly summary</span>
                </div>
                <span class="action-arrow">›</span>
              </a>
              <a routerLink="/work-entries" class="quick-action-link">
                <span class="action-ico">📋</span>
                <div class="action-info">
                  <span class="action-title">All Historical Entries</span>
                  <span class="action-desc">Search full database (AllData)</span>
                </div>
                <span class="action-arrow">›</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- 5. Quick Entry Modal (Glassmorphism & Segmented UI) -->
      <div class="modal-backdrop" *ngIf="showModal" (click)="onBackdropClick($event)">
        <div class="modal-dialog">
          <div class="modal-header-hero">
            <div>
              <h3>{{ editingEntryId ? 'Edit Work Entry' : 'Add Work Entry' }}</h3>
              <span class="modal-date-tag">🗓️ {{ selectedDate | date:'fullDate' }}</span>
            </div>
            <button class="modal-close-button" (click)="closeModal()">×</button>
          </div>

          <form (ngSubmit)="saveEntry()" class="modal-form">
            <div class="form-section-title">TASK INFORMATION</div>
            <div class="form-row-2">
              <div class="form-group">
                <label>Task / Work Item #</label>
                <input type="text" [(ngModel)]="entryForm.taskNumber" (blur)="onTaskNumberBlur()" name="taskNumber" placeholder="e.g. 358112" />
              </div>
              <div class="form-group">
                <label>Category</label>
                <select [(ngModel)]="entryForm.categoryId" name="categoryId">
                  <option *ngFor="let c of categories" [ngValue]="c.categoryId">{{ c.name }}</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>Description *</label>
              <textarea [(ngModel)]="entryForm.description" name="description" rows="2" placeholder="Task description or work requirement" required></textarea>
            </div>

            <div class="form-row-2">
              <div class="form-group">
                <label>Meeting (Optional)</label>
                <select [(ngModel)]="entryForm.meetingId" name="meetingId" (ngModelChange)="onMeetingSelect($event)">
                  <option [ngValue]="null">-- No Meeting --</option>
                  <option *ngFor="let m of meetings" [ngValue]="m.meetingId">{{ m.meetingName }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>Meeting Name (Custom)</label>
                <input type="text" [(ngModel)]="entryForm.meetingName" name="meetingName" placeholder="Or custom meeting title" />
              </div>
            </div>

            <!-- Effort Breakdown Box -->
            <div class="form-section-title">PLANNING & EFFORT CALCULATOR</div>
            <div class="effort-calculator-card">
              <div class="calc-inputs-grid">
                <div class="calc-input-group">
                  <span class="calc-label">Planned (h)</span>
                  <input type="number" step="0.25" min="0" [(ngModel)]="entryForm.plannedEffortHours" name="plannedEffort" />
                </div>
                <div class="calc-input-group">
                  <span class="calc-label">Meeting (h)</span>
                  <input type="number" step="0.25" min="0" [(ngModel)]="entryForm.meetingEffortHours" (ngModelChange)="onEffortChange()" name="meetingEffort" />
                </div>
                <div class="calc-input-group">
                  <span class="calc-label">Work (h)</span>
                  <input type="number" step="0.25" min="0" [(ngModel)]="entryForm.workEffortHours" (ngModelChange)="onEffortChange()" name="workEffort" />
                </div>
                <div class="calc-total-group">
                  <span class="calc-label">Total Actual</span>
                  <span class="calc-total-val">{{ ((entryForm.meetingEffortHours || 0) + (entryForm.workEffortHours || 0)).toFixed(2) }}h</span>
                </div>
              </div>
            </div>

            <div class="form-row-2">
              <div class="form-group">
                <label>Status</label>
                <select [(ngModel)]="entryForm.status" name="status">
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Fixed">Fixed</option>
                  <option value="On Hold">On Hold</option>
                </select>
              </div>
              <div class="form-group">
                <label>Remarks / Progress Notes</label>
                <input type="text" [(ngModel)]="entryForm.remarks" name="remarks" placeholder="Progress notes or update" />
              </div>
            </div>

            <div class="modal-footer-actions">
              <button type="button" class="btn btn-secondary btn-pill" (click)="closeModal()">Cancel</button>
              <button type="submit" class="btn btn-primary btn-pill cta-glow" [disabled]="isSaving">
                {{ isSaving ? 'Saving...' : (editingEntryId ? 'Update Entry' : 'Save Entry') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .daily-work-page {
      max-width: 1440px;
      margin: 0 auto;
    }

    /* Page Header */
    .page-header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      h2 {
        font-size: 24px;
        font-weight: 800;
        color: #F8FAFC;
        letter-spacing: -0.02em;
      }
      .subtitle {
        font-size: 13px;
        color: var(--text-muted);
        margin-top: 2px;
      }
    }
    .status-pill-synced {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: var(--status-optimal-bg);
      color: var(--status-optimal-text);
      border: 1px solid var(--status-optimal-border);
      padding: 4px 12px;
      border-radius: var(--radius-pill);
      font-size: 12px;
      font-weight: 700;
    }
    .dot-pulse {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #34D399;
      box-shadow: 0 0 6px #34D399;
    }

    /* 1. Date Navigator Hero */
    .date-hero-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 24px;
      background: #101E33;
      border-radius: var(--radius-lg);
    }

    .date-navigator-pill {
      display: flex;
      align-items: center;
      gap: 10px;
      background: #0B1728;
      padding: 5px 10px;
      border-radius: var(--radius-pill);
      border: 1px solid var(--border-primary);
    }

    .nav-arrow-btn {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #14243B;
      border: 1px solid var(--border-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 16px;
      font-weight: 700;
      color: #F8FAFC;
      transition: var(--transition-smooth);

      &:hover {
        background: var(--gold-gradient);
        color: #07111F;
        border-color: transparent;
      }
    }

    .date-display-box {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .date-picker-input {
      border: none;
      background: transparent;
      font-family: var(--font-sans);
      font-size: 14px;
      font-weight: 700;
      color: #F8FAFC;
      outline: none;
      cursor: pointer;
    }

    .day-badge {
      background: rgba(214, 179, 106, 0.15);
      color: var(--gold-highlight);
      font-size: 11.5px;
      font-weight: 700;
      padding: 2px 10px;
      border-radius: var(--radius-pill);
      border: 1px solid rgba(214, 179, 106, 0.3);
    }

    .today-pill-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      background: #14243B;
      border: 1px solid var(--border-primary);
      border-radius: var(--radius-pill);
      padding: 4px 12px;
      font-size: 12px;
      font-weight: 700;
      color: #F8FAFC;
      cursor: pointer;
      transition: var(--transition-smooth);

      &:hover, &.is-today {
        background: var(--gold-gradient);
        color: #07111F;
        border-color: transparent;
        box-shadow: var(--gold-glow-subtle);
      }
    }

    .sparkle-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #07111F;
    }

    .hero-actions-group {
      display: flex;
      gap: 12px;
    }
    .btn-icon { font-size: 14px; }
    .cta-glow { box-shadow: var(--gold-glow-subtle); }

    /* 2. Single-Row KPI Metric Cards */
    .kpi-hero-container {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 18px;
      margin-bottom: 24px;
    }

    .metric-card {
      background: #101E33;
      border-radius: var(--radius-lg);
      border: 1px solid var(--border-subtle);
      padding: 18px 20px;
      box-shadow: var(--shadow-card);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: var(--transition-smooth);

      &:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-card-hover);
        border-color: rgba(214, 179, 106, 0.25);
      }
    }

    .metric-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .metric-label {
      font-size: 11px;
      font-weight: 700;
      color: var(--text-muted);
      letter-spacing: 0.05em;
    }

    .metric-icon-bubble {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;

      &.base { background: rgba(96, 165, 250, 0.15); color: #60A5FA; }
      &.plan { background: rgba(214, 179, 106, 0.15); color: var(--gold-highlight); }
      &.split { background: rgba(167, 139, 250, 0.15); color: #A78BFA; }
      &.hero { background: rgba(52, 211, 153, 0.15); color: #34D399; }
    }

    .metric-body { margin-bottom: 12px; }
    .metric-value {
      font-size: 26px;
      font-weight: 800;
      color: #F8FAFC;
      letter-spacing: -0.02em;
    }
    .metric-unit {
      font-size: 16px;
      font-weight: 600;
      color: var(--text-muted);
      margin-left: 2px;
    }
    .split-divider {
      color: var(--border-primary);
      font-weight: 400;
      margin: 0 4px;
    }
    .metric-sub {
      display: block;
      font-size: 11.5px;
      color: var(--text-secondary);
      font-weight: 500;
      margin-top: 2px;
    }

    .mini-progress-track {
      height: 5px;
      background: #0B1728;
      border-radius: var(--radius-pill);
      overflow: hidden;
    }
    .mini-progress-fill {
      height: 100%;
      border-radius: var(--radius-pill);
      transition: width 0.3s ease;

      &.base { background: #60A5FA; }
      &.plan { background: var(--gold-primary); }
      &.hero-fill { background: linear-gradient(90deg, #34D399, #10B981); }
    }

    .split-progress-track {
      height: 6px;
      background: #0B1728;
      border-radius: var(--radius-pill);
      display: flex;
      overflow: hidden;
    }
    .split-fill-work { background: #60A5FA; height: 100%; }
    .split-fill-meeting { background: #A78BFA; height: 100%; }

    .status-glow-badge {
      display: inline-block;
      font-size: 11px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: var(--radius-pill);
      margin-top: 4px;

      &.optimal { background: var(--status-optimal-bg); color: var(--status-optimal-text); }
      &.over { background: var(--status-critical-bg); color: var(--status-critical-text); }
    }

    /* Layout Split */
    .dashboard-split-layout {
      display: grid;
      grid-template-columns: 1fr 320px;
      gap: 24px;
      align-items: start;
    }

    .table-card { padding: 24px; }
    .table-header-flex { display: flex; justify-content: space-between; align-items: center; }

    .entry-row:hover { background: var(--bg-surface-hover); }
    .task-desc { font-weight: 600; color: #F8FAFC; line-height: 1.4; }

    .category-capsule {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 3px 10px;
      border-radius: var(--radius-pill);
      font-size: 11.5px;
      font-weight: 700;
      border: 1px solid transparent;
    }
    .cat-dot { width: 6px; height: 6px; border-radius: 50%; }

    .meeting-text { font-size: 12.5px; color: var(--text-platinum); font-weight: 500; }
    .muted-dash { color: var(--text-muted); }

    .metric-num { font-family: var(--font-mono); font-size: 13px; color: var(--text-secondary); }
    .metric-num-bold { font-family: var(--font-mono); font-size: 13px; font-weight: 700; color: #F8FAFC; }
    .total-pill { background: rgba(214, 179, 106, 0.15); color: var(--gold-highlight); padding: 2px 8px; border-radius: 6px; border: 1px solid rgba(214, 179, 106, 0.25); }

    .remarks-text { font-size: 12px; color: var(--text-muted); max-width: 140px; text-overflow: ellipsis; white-space: nowrap; overflow: hidden; display: inline-block; }

    .table-actions-cell { text-align: center; }
    .action-btn-group { display: inline-flex; gap: 6px; }
    .action-btn {
      width: 28px;
      height: 28px;
      border-radius: 6px;
      background: #14243B;
      border: 1px solid var(--border-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 12px;
      transition: var(--transition-smooth);

      &:hover { transform: translateY(-1px); background: #182B45; border-color: var(--border-gold); }
      &.delete:hover { background: var(--status-critical-bg); border-color: var(--status-critical-border); }
    }

    .empty-table-state {
      text-align: center;
      padding: 48px 24px;
      h4 { font-size: 16px; font-weight: 700; color: #F8FAFC; margin-top: 10px; }
      p { font-size: 13px; color: var(--text-muted); margin-top: 4px; }
    }
    .empty-icon-bubble { font-size: 32px; }

    /* Right Column Supporting Panels */
    .supporting-sidebar-col {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .donut-visual-container {
      display: flex;
      justify-content: center;
      padding: 16px 0;
    }
    .donut-ring-graphic {
      width: 130px;
      height: 130px;
      border-radius: 50%;
      background: conic-gradient(#60A5FA 0% 80%, #A78BFA 80% 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      box-shadow: 0 4px 10px rgba(0,0,0,0.4);

      &::after {
        content: '';
        position: absolute;
        width: 96px;
        height: 96px;
        border-radius: 50%;
        background: #101E33;
      }
    }
    .ring-center-content {
      position: relative;
      z-index: 10;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .ring-val { font-size: 18px; font-weight: 800; color: #F8FAFC; }
    .ring-lbl { font-size: 10px; font-weight: 700; color: var(--gold-highlight); text-transform: uppercase; }

    .side-legend-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
      border-top: 1px solid var(--border-subtle);
      padding-top: 14px;
    }
    .legend-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 12.5px;
      font-weight: 600;
    }
    .legend-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      display: inline-block;
      margin-right: 6px;
      &.work { background: #60A5FA; }
      &.meeting { background: #A78BFA; }
      &.cap { background: #34D399; }
    }
    .legend-text { color: var(--text-secondary); }
    .legend-val { color: #F8FAFC; font-family: var(--font-mono); }

    .action-card-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .quick-action-link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      border-radius: var(--radius-md);
      background: #0B1728;
      border: 1px solid var(--border-primary);
      text-decoration: none;
      transition: var(--transition-smooth);

      &:hover {
        background: #14243B;
        border-color: var(--gold-primary);
        transform: translateX(2px);
      }
    }
    .action-ico { font-size: 18px; }
    .action-info { display: flex; flex-direction: column; flex: 1; }
    .action-title { font-size: 13px; font-weight: 700; color: #F8FAFC; }
    .action-desc { font-size: 11px; color: var(--text-muted); }
    .action-arrow { font-size: 16px; font-weight: 700; color: var(--gold-highlight); }

    /* Modal Dialog */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(2, 8, 23, 0.85);
      backdrop-filter: blur(10px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: modalFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .modal-dialog {
      background: #101E33;
      border-radius: var(--radius-xl);
      width: 100%;
      max-width: 620px;
      padding: 28px;
      box-shadow: var(--shadow-modal);
      border: 1px solid var(--border-primary);
    }
    .modal-header-hero {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
      h3 { font-size: 18px; font-weight: 800; color: #F8FAFC; letter-spacing: -0.01em; }
    }
    .modal-date-tag { font-size: 12px; color: var(--gold-highlight); font-weight: 600; }
    .modal-close-button {
      background: transparent;
      border: none;
      font-size: 24px;
      color: var(--text-muted);
      cursor: pointer;
      line-height: 1;
      &:hover { color: #FFFFFF; }
    }
    .form-section-title {
      font-size: 10.5px;
      font-weight: 800;
      color: var(--gold-highlight);
      letter-spacing: 0.08em;
      margin: 12px 0 8px;
    }
    .form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

    .effort-calculator-card {
      background: #0B1728;
      border: 1.5px dashed var(--border-primary);
      border-radius: var(--radius-md);
      padding: 14px;
      margin-bottom: 16px;
    }
    .calc-inputs-grid { display: grid; grid-template-columns: 1fr 1fr 1fr 1.2fr; gap: 10px; align-items: center; }
    .calc-input-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
      input { padding: 6px 10px; font-size: 13px; font-weight: 700; border-radius: 6px; border: 1px solid var(--border-primary); background: #101E33; }
    }
    .calc-label { font-size: 11px; font-weight: 600; color: var(--text-muted); }
    .calc-total-group {
      background: rgba(214, 179, 106, 0.15);
      border: 1px solid rgba(214, 179, 106, 0.3);
      padding: 6px 10px;
      border-radius: 8px;
      text-align: center;
      display: flex;
      flex-direction: column;
    }
    .calc-total-val { font-size: 16px; font-weight: 800; color: var(--gold-highlight); }

    .modal-footer-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 20px;
    }

    /* Toast */
    .toast-notification {
      position: fixed;
      top: 24px;
      right: 24px;
      z-index: 2000;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 20px;
      border-radius: var(--radius-lg);
      box-shadow: 0 10px 30px rgba(0,0,0,0.7);
      animation: slideInToast 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .toast-notification.success { background: #101E33; border-left: 5px solid #34D399; border: 1px solid var(--border-primary); }
    .toast-icon { font-size: 20px; }
    .toast-content { display: flex; flex-direction: column; }
    .toast-title { font-size: 13px; font-weight: 800; color: #F8FAFC; }
    .toast-text { font-size: 12.5px; color: var(--text-platinum); }

    @keyframes modalFadeIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
    @keyframes slideInToast { from { transform: translateY(-20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

    @media (max-width: 1024px) {
      .dashboard-split-layout { grid-template-columns: 1fr; }
      .kpi-hero-container { grid-template-columns: repeat(2, 1fr); }
    }
  `]
})
export class DailyWorkComponent implements OnInit {
  selectedDate: string = new Date().toISOString().substring(0, 10);
  screenData: DailyWorkScreen | null = null;

  readonly DEFAULT_CATEGORIES: Category[] = [
    { categoryId: 1, name: 'Development', colorCode: '#60A5FA', isActive: true, totalEntriesCount: 0, totalEffortHours: 0 },
    { categoryId: 2, name: 'Bug Fix', colorCode: '#F87171', isActive: true, totalEntriesCount: 0, totalEffortHours: 0 },
    { categoryId: 3, name: 'Support', colorCode: '#FBBF24', isActive: true, totalEntriesCount: 0, totalEffortHours: 0 },
    { categoryId: 4, name: 'Utility', colorCode: '#34D399', isActive: true, totalEntriesCount: 0, totalEffortHours: 0 },
    { categoryId: 5, name: 'Discussion', colorCode: '#A78BFA', isActive: true, totalEntriesCount: 0, totalEffortHours: 0 },
    { categoryId: 6, name: 'Code Review', colorCode: '#38BDF8', isActive: true, totalEntriesCount: 0, totalEffortHours: 0 },
    { categoryId: 7, name: 'Testing', colorCode: '#4ADE80', isActive: true, totalEntriesCount: 0, totalEffortHours: 0 },
    { categoryId: 8, name: 'Deployment', colorCode: '#C084FC', isActive: true, totalEntriesCount: 0, totalEffortHours: 0 },
    { categoryId: 9, name: 'Documentation', colorCode: '#94A3B8', isActive: true, totalEntriesCount: 0, totalEffortHours: 0 },
    { categoryId: 10, name: 'General', colorCode: '#2DD4BF', isActive: true, totalEntriesCount: 0, totalEffortHours: 0 }
  ];

  categories: Category[] = [];
  meetings: Meeting[] = [];

  showModal = false;
  isSaving = false;
  editingEntryId: number | null = null;

  toastMessage: string | null = null;
  toastType: 'success' | 'error' | 'info' = 'success';
  private toastTimer: any = null;

  entryForm: any = {
    taskNumber: '',
    categoryId: 1,
    description: '',
    meetingId: null,
    meetingName: '',
    plannedEffortHours: 8,
    meetingEffortHours: 0,
    workEffortHours: 8,
    status: 'In Progress',
    remarks: ''
  };

  constructor(private api: ApiService, private route: ActivatedRoute) {
    this.categories = [...this.DEFAULT_CATEGORIES];
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['date']) {
        this.selectedDate = params['date'];
      }
      this.loadData();
    });

    this.api.getCategories().subscribe(res => {
      if (res.success && res.data && res.data.length > 0) {
        this.categories = res.data;
      }
    });

    this.api.getMeetings().subscribe(res => {
      if (res.success && res.data) {
        this.meetings = res.data;
      }
    });
  }

  isCurrentToday(): boolean {
    return this.selectedDate === new Date().toISOString().substring(0, 10);
  }

  getProgressPercent(actual: number, planned: number): number {
    if (!planned || planned <= 0) return 0;
    const p = Math.round((actual / planned) * 100);
    return p > 100 ? 100 : p;
  }

  getWorkPercent(): number {
    const w = this.screenData?.totalWorkHours || 0;
    const m = this.screenData?.totalMeetingHours || 0;
    const total = w + m;
    return total > 0 ? Math.round((w / total) * 100) : 100;
  }

  getMeetingPercent(): number {
    const w = this.screenData?.totalWorkHours || 0;
    const m = this.screenData?.totalMeetingHours || 0;
    const total = w + m;
    return total > 0 ? Math.round((m / total) * 100) : 0;
  }

  showToast(message: string, type: 'success' | 'error' | 'info' = 'success') {
    this.toastMessage = message;
    this.toastType = type;
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.toastMessage = null;
    }, 4000);
  }

  getDayName(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'long' });
  }

  loadData() {
    this.api.getDailyWork(this.selectedDate).subscribe({
      next: res => {
        if (res.success && res.data) {
          this.screenData = res.data;
        }
      },
      error: err => {
        console.error('Failed to load daily work', err);
      }
    });
  }

  onDateChange(newDate: string) {
    this.selectedDate = newDate;
    this.loadData();
  }

  changeDay(delta: number) {
    const d = new Date(this.selectedDate);
    d.setDate(d.getDate() + delta);
    this.selectedDate = d.toISOString().substring(0, 10);
    this.loadData();
  }

  goToToday() {
    this.selectedDate = new Date().toISOString().substring(0, 10);
    this.loadData();
  }

  copyPreviousDay() {
    const prevDate = new Date(this.selectedDate);
    prevDate.setDate(prevDate.getDate() - 1);
    const prevStr = prevDate.toISOString().substring(0, 10);

    this.api.copyWorkEntries({ sourceDate: prevStr, targetDate: this.selectedDate }).subscribe({
      next: res => {
        if (res.success) {
          this.showToast('Work entries copied from previous day!', 'success');
          this.loadData();
        } else {
          this.showToast(res.message || 'Copy failed', 'error');
        }
      },
      error: err => {
        this.showToast(err.error?.message || 'Error copying entries', 'error');
      }
    });
  }

  openAddModal() {
    this.editingEntryId = null;
    this.entryForm = {
      taskNumber: '',
      categoryId: this.categories.length > 0 ? this.categories[0].categoryId : 1,
      description: '',
      meetingId: null,
      meetingName: '',
      plannedEffortHours: 8,
      meetingEffortHours: 0,
      workEffortHours: 8,
      status: 'In Progress',
      remarks: ''
    };
    this.showModal = true;
  }

  openEditModal(entry: WorkEntry) {
    this.editingEntryId = entry.workEntryId;
    this.entryForm = {
      taskNumber: entry.taskNumber || '',
      categoryId: entry.categoryId || 1,
      description: entry.description,
      meetingId: entry.meetingId || null,
      meetingName: entry.meetingName || '',
      plannedEffortHours: entry.plannedEffortHours,
      meetingEffortHours: entry.meetingEffortHours,
      workEffortHours: entry.workEffortHours,
      status: entry.status,
      remarks: entry.remarks || ''
    };
    this.showModal = true;
  }

  onTaskNumberBlur() {
    const raw = this.entryForm.taskNumber?.trim() || '';
    if (!raw) return;

    const match = raw.match(/(?:Task|Bug|Ticket|CR|#)\s*(?:No\.?\s*)?([A-Za-z0-9\-_]+)[:\s\-]*(.*)/i);
    if (match) {
      this.entryForm.taskNumber = match[1].trim();
      if (!this.entryForm.description && match[2]) {
        this.entryForm.description = raw;
      }
      if (raw.toLowerCase().includes('dev') || raw.toLowerCase().includes('requirement')) {
        const devCat = this.categories.find(c => c.name.toLowerCase().includes('development'));
        if (devCat) this.entryForm.categoryId = devCat.categoryId;
      }
    } else if (!this.entryForm.description && raw.length > 15) {
      this.entryForm.description = raw;
    }
  }

  onEffortChange() {
    const total = (this.entryForm.meetingEffortHours || 0) + (this.entryForm.workEffortHours || 0);
    if (this.entryForm.plannedEffortHours === 0 || this.entryForm.plannedEffortHours === 8) {
      this.entryForm.plannedEffortHours = total;
    }
  }

  onMeetingSelect(meetingId: number) {
    const m = this.meetings.find(x => x.meetingId === meetingId);
    if (m) {
      this.entryForm.meetingName = m.meetingName;
      if (this.entryForm.meetingEffortHours === 0) {
        this.entryForm.meetingEffortHours = m.defaultDurationHours;
      }
      if (this.entryForm.workEffortHours === 8) {
        this.entryForm.workEffortHours = Math.max(0, 8 - m.defaultDurationHours);
      }
    }
  }

  duplicateEntry(entry: WorkEntry) {
    this.api.createWorkEntry({
      workDate: this.selectedDate,
      taskNumber: entry.taskNumber,
      description: entry.description,
      categoryId: entry.categoryId || 1,
      meetingId: entry.meetingId,
      meetingName: entry.meetingName,
      plannedEffortHours: entry.plannedEffortHours,
      meetingEffortHours: entry.meetingEffortHours,
      workEffortHours: entry.workEffortHours,
      status: entry.status,
      remarks: entry.remarks
    }).subscribe({
      next: () => {
        this.showToast('Work entry duplicated successfully!', 'success');
        this.loadData();
      },
      error: err => this.showToast(err.error?.message || 'Duplicate failed', 'error')
    });
  }

  clearAllToday() {
    if (!confirm(`Are you sure you want to delete all ${this.screenData?.entries?.length} entries for ${this.selectedDate}?`)) {
      return;
    }
    const allEntries: WorkEntry[] = JSON.parse(localStorage.getItem('dwpts_entries') || '[]');
    const remaining = allEntries.filter(e => e.workDate !== this.selectedDate);
    localStorage.setItem('dwpts_entries', JSON.stringify(remaining));
    this.loadData();
    this.showToast('Cleared all entries for today!', 'info');
  }

  deleteEntry(id: number) {
    if (confirm('Are you sure you want to delete this work entry?')) {
      this.api.deleteWorkEntry(id).subscribe({
        next: () => {
          this.showToast('Work entry deleted successfully!', 'info');
          this.loadData();
        },
        error: err => this.showToast(err.error?.message || 'Delete failed', 'error')
      });
    }
  }

  onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.closeModal();
    }
  }

  closeModal() {
    this.showModal = false;
    this.isSaving = false;
  }

  saveEntry() {
    if (!this.entryForm.description?.trim()) {
      this.showToast('Please enter a description.', 'error');
      return;
    }

    this.isSaving = true;
    const payload = {
      ...this.entryForm,
      workDate: this.selectedDate,
      categoryId: this.entryForm.categoryId || (this.categories.length > 0 ? this.categories[0].categoryId : 1)
    };

    if (this.editingEntryId) {
      this.api.updateWorkEntry(this.editingEntryId, payload).subscribe({
        next: res => {
          this.isSaving = false;
          if (res.success) {
            this.showToast('Work entry updated successfully in database!', 'success');
            this.closeModal();
            this.loadData();
          } else {
            this.showToast(res.message || 'Update failed', 'error');
          }
        },
        error: err => {
          this.isSaving = false;
          this.showToast(err.error?.message || 'Server error updating entry', 'error');
        }
      });
    } else {
      this.api.createWorkEntry(payload).subscribe({
        next: res => {
          this.isSaving = false;
          if (res.success) {
            this.showToast('Work entry saved successfully in database!', 'success');
            this.closeModal();
            this.loadData();
          } else {
            this.showToast(res.message || 'Save failed', 'error');
          }
        },
        error: err => {
          this.isSaving = false;
          this.showToast(err.error?.message || 'Server error saving entry', 'error');
        }
      });
    }
  }
}
