import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Leave } from '../../core/models/models';

@Component({
  selector: 'app-leaves',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="leaves-page">
      <div class="page-title-row">
        <div>
          <h2>🏖️ Leave Management & Time-Off</h2>
          <p class="subtitle">Apply for planned leaves, festival holidays, and track approval matrix</p>
        </div>
        <button class="btn btn-primary" (click)="openApplyModal()">+ Apply Leave Request</button>
      </div>

      <!-- KPI Summary Cards -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <span class="kpi-label">Total Leaves Taken</span>
          <span class="kpi-value" style="color: var(--text-gold);">{{ totalLeavesDays }} days</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">Approved Requests</span>
          <span class="kpi-value" style="color: #34D399;">{{ approvedLeavesCount }}</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">Pending Approval</span>
          <span class="kpi-value" style="color: #FBBF24;">{{ pendingLeavesCount }}</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">Available Casual / Optional</span>
          <span class="kpi-value" style="color: #60A5FA;">12 days</span>
        </div>
      </div>

      <!-- Leaves Table Card -->
      <div class="dwpts-card">
        <div class="card-header">
          <h3>Leave History & Applications</h3>
          <span class="subtitle">Real-time status across authorized employee records</span>
        </div>

        <div class="dwpts-table-container">
          <table class="dwpts-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Leave Type</th>
                <th>From Date</th>
                <th>To Date</th>
                <th>Duration</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let l of leaves">
                <td><strong>{{ l.employeeName }}</strong></td>
                <td><span class="leave-type-pill">{{ l.leaveTypeName }}</span></td>
                <td><strong>{{ l.fromDate | date:'mediumDate' }}</strong></td>
                <td><strong>{{ l.toDate | date:'mediumDate' }}</strong></td>
                <td>{{ l.durationDays }} day(s) ({{ l.durationHours }}h)</td>
                <td>{{ l.reason || '-' }}</td>
                <td>
                  <span class="badge" [ngClass]="{'status-completed': l.status === 'Approved', 'status-inprogress': l.status === 'Pending', 'status-warning': l.status === 'Rejected'}">
                    {{ l.status }}
                  </span>
                </td>
                <td>
                  <button class="btn btn-sm btn-outline-danger" (click)="cancelLeave(l.employeeLeaveId)" title="Cancel Leave">🗑️</button>
                </td>
              </tr>
              <tr *ngIf="leaves.length === 0">
                <td colspan="8" style="text-align: center; color: #94a3b8; padding: 32px;">
                  <div style="font-size: 28px; margin-bottom: 8px;">🌴</div>
                  <div>No leave requests recorded yet. Click <strong>"+ Apply Leave Request"</strong> to apply.</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Apply Leave Modal -->
      <div class="modal-backdrop" *ngIf="showModal" (click)="onBackdropClick($event)">
        <div class="modal-card dwpts-card animate-fade-in">
          <div class="modal-header">
            <h3>🏖️ Apply Leave Application</h3>
            <button class="close-btn" (click)="closeModal()">✕</button>
          </div>

          <div class="modal-body">
            <div class="form-grid">
              <div class="form-group full-width">
                <label>Leave Type *</label>
                <select class="form-control" [(ngModel)]="leaveForm.leaveTypeName">
                  <option value="Casual Leave">Casual Leave (CL)</option>
                  <option value="Sick Leave">Sick Leave (SL)</option>
                  <option value="Earned Leave">Earned / Privilege Leave (EL)</option>
                  <option value="Optional Holiday">Optional Holiday / Festival Leave (Rakhi / Eid / Diwali)</option>
                  <option value="Compensatory Off">Compensatory Off (Comp-Off)</option>
                </select>
              </div>

              <div class="form-group">
                <label>From Date *</label>
                <input type="date" class="form-control" [(ngModel)]="leaveForm.fromDate" (change)="calculateDuration()" />
              </div>

              <div class="form-group">
                <label>To Date *</label>
                <input type="date" class="form-control" [(ngModel)]="leaveForm.toDate" (change)="calculateDuration()" />
              </div>

              <div class="form-group full-width duration-preview">
                <span class="duration-badge">⏱️ Duration: <strong>{{ calculatedDays }} Day(s)</strong> ({{ calculatedDays * 8 }} Hours)</span>
              </div>

              <div class="form-group full-width">
                <label>Reason / Comments *</label>
                <textarea class="form-control" rows="3" placeholder="e.g. Rakhi festival celebration, Personal appointment" [(ngModel)]="leaveForm.reason"></textarea>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="closeModal()">Cancel</button>
            <button class="btn btn-primary" (click)="submitLeave()">Submit Application</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .leaves-page { display: flex; flex-direction: column; gap: 20px; }
    .page-title-row { display: flex; justify-content: space-between; align-items: center; }
    .page-title-row h2 { font-size: 22px; font-weight: 800; color: var(--text-primary); }
    .subtitle { font-size: 13px; color: var(--text-muted); margin-top: 4px; }

    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
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

    .leave-type-pill {
      background: rgba(96, 165, 250, 0.15);
      color: #60A5FA;
      border: 1px solid rgba(96, 165, 250, 0.3);
      padding: 2px 8px;
      border-radius: var(--radius-pill);
      font-size: 11px;
      font-weight: 700;
    }

    .modal-backdrop {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(10, 15, 30, 0.75);
      backdrop-filter: blur(4px);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .modal-card {
      background: #111827;
      border: 1px solid var(--border-gold-subtle);
      border-radius: var(--radius-xl);
      width: 100%;
      max-width: 520px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.6);
      display: flex;
      flex-direction: column;
    }
    .modal-header {
      padding: 16px 20px;
      border-bottom: 1px solid var(--border-gold-subtle);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .modal-header h3 { font-size: 16px; font-weight: 800; color: var(--text-gold); }
    .close-btn { background: none; border: none; font-size: 18px; color: var(--text-muted); cursor: pointer; }
    .close-btn:hover { color: #fff; }

    .modal-body { padding: 20px; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-group.full-width { grid-column: 1 / -1; }
    .form-group label { font-size: 12px; font-weight: 700; color: var(--text-muted); }
    .form-control {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: var(--radius-md);
      color: #fff;
      padding: 8px 12px;
      font-size: 13px;
    }
    .duration-preview {
      background: rgba(52, 211, 153, 0.1);
      border: 1px dashed rgba(52, 211, 153, 0.3);
      padding: 10px;
      border-radius: var(--radius-md);
      text-align: center;
    }
    .duration-badge { font-size: 13px; color: #34D399; font-weight: 600; }

    .modal-footer {
      padding: 14px 20px;
      border-top: 1px solid var(--border-gold-subtle);
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }
  `]
})
export class LeavesComponent implements OnInit {
  leaves: Leave[] = [];
  showModal = false;

  leaveForm = {
    leaveTypeName: 'Casual Leave',
    fromDate: '2026-08-28',
    toDate: '2026-08-28',
    reason: ''
  };

  calculatedDays = 1;

  constructor(private api: ApiService) {}

  ngOnInit() {
    const today = new Date().toISOString().substring(0, 10);
    this.leaveForm.fromDate = today;
    this.leaveForm.toDate = today;
    this.loadLeaves();
  }

  get totalLeavesDays(): number {
    return this.leaves.reduce((sum, l) => sum + (l.durationDays || 0), 0);
  }

  get approvedLeavesCount(): number {
    return this.leaves.filter(l => l.status === 'Approved').length;
  }

  get pendingLeavesCount(): number {
    return this.leaves.filter(l => l.status === 'Pending').length;
  }

  loadLeaves() {
    this.api.getLeaves().subscribe(res => {
      this.leaves = res.data || [];
    });
  }

  openApplyModal() {
    const today = new Date().toISOString().substring(0, 10);
    this.leaveForm = {
      leaveTypeName: 'Casual Leave',
      fromDate: today,
      toDate: today,
      reason: ''
    };
    this.calculateDuration();
    this.showModal = true;
  }

  calculateDuration() {
    if (!this.leaveForm.fromDate || !this.leaveForm.toDate) {
      this.calculatedDays = 1;
      return;
    }
    const f = new Date(this.leaveForm.fromDate);
    const t = new Date(this.leaveForm.toDate);
    const diff = t.getTime() - f.getTime();
    this.calculatedDays = Math.max(1, Math.round(diff / (1000 * 3600 * 24)) + 1);
  }

  closeModal() {
    this.showModal = false;
  }

  onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.closeModal();
    }
  }

  submitLeave() {
    if (!this.leaveForm.reason.trim()) {
      alert('Please provide a reason for the leave application.');
      return;
    }

    this.api.applyLeave({
      leaveTypeName: this.leaveForm.leaveTypeName,
      fromDate: this.leaveForm.fromDate,
      toDate: this.leaveForm.toDate,
      durationDays: this.calculatedDays,
      reason: this.leaveForm.reason
    }).subscribe(() => {
      this.closeModal();
      this.loadLeaves();
    });
  }

  cancelLeave(id: number) {
    if (confirm('Are you sure you want to cancel this leave application?')) {
      const all: Leave[] = JSON.parse(localStorage.getItem('dwpts_leaves') || '[]');
      const filtered = all.filter(l => l.employeeLeaveId !== id);
      localStorage.setItem('dwpts_leaves', JSON.stringify(filtered));
      this.loadLeaves();
    }
  }
}
