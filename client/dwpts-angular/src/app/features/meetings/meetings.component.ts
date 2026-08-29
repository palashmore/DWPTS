import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Meeting, MeetingAnalysis } from '../../core/models/models';

@Component({
  selector: 'app-meetings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="meetings-page">
      <div class="page-title-row">
        <div>
          <h2>📅 Meeting Management & Master Configuration</h2>
          <p class="subtitle">Configure meeting titles, default durations, and analyze organization sync effort</p>
        </div>
        <button class="btn btn-primary" (click)="openCreateModal()">+ Add Meeting Master</button>
      </div>

      <!-- KPI Summary Bar -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <span class="kpi-label">Configured Meetings</span>
          <span class="kpi-value" style="color: var(--text-gold);">{{ meetings.length }}</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">Total Meeting Effort</span>
          <span class="kpi-value" style="color: #60A5FA;">{{ totalMeetingHours.toFixed(1) }}h</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">Average Duration</span>
          <span class="kpi-value" style="color: #34D399;">{{ avgMeetingDuration.toFixed(1) }}h</span>
        </div>
      </div>

      <!-- Meetings Table Card -->
      <div class="dwpts-card">
        <div class="card-header">
          <h3>Active Meeting Masters</h3>
          <span class="subtitle">Available in Daily Work task entry dropdown</span>
        </div>

        <div class="dwpts-table-container">
          <table class="dwpts-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Meeting Title</th>
                <th>Default Duration</th>
                <th>Description</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let m of meetings; let i = index">
                <td>{{ i + 1 }}</td>
                <td><strong>{{ m.meetingName }}</strong></td>
                <td><span class="duration-pill">{{ m.defaultDurationHours }}h</span></td>
                <td>{{ m.description || '-' }}</td>
                <td><span class="badge status-completed">Active</span></td>
                <td>
                  <button class="btn btn-sm btn-outline-danger" (click)="deleteMeeting(m.meetingId)" title="Delete Meeting Master">🗑️</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Create Meeting Modal -->
      <div class="modal-backdrop" *ngIf="showModal" (click)="onBackdropClick($event)">
        <div class="modal-card dwpts-card animate-fade-in">
          <div class="modal-header">
            <h3>📅 Add Meeting Master</h3>
            <button class="close-btn" (click)="closeModal()">✕</button>
          </div>

          <div class="modal-body">
            <div class="form-grid">
              <div class="form-group full-width">
                <label>Meeting Title *</label>
                <input type="text" class="form-control" placeholder="e.g. Internal Meeting / Discussions, Sprint Retro" [(ngModel)]="meetForm.meetingName" />
              </div>

              <div class="form-group">
                <label>Default Duration (Hours) *</label>
                <input type="number" step="0.5" class="form-control" [(ngModel)]="meetForm.defaultDurationHours" />
              </div>

              <div class="form-group full-width">
                <label>Description / Agenda</label>
                <input type="text" class="form-control" placeholder="Purpose or context of meeting" [(ngModel)]="meetForm.description" />
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="closeModal()">Cancel</button>
            <button class="btn btn-primary" (click)="saveMeeting()">Save Meeting Master</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .meetings-page { display: flex; flex-direction: column; gap: 20px; }
    .page-title-row { display: flex; justify-content: space-between; align-items: center; }
    .page-title-row h2 { font-size: 22px; font-weight: 800; color: var(--text-primary); }
    .subtitle { font-size: 13px; color: var(--text-muted); margin-top: 4px; }

    .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
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

    .duration-pill {
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
      max-width: 480px;
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
    .form-grid { display: flex; flex-direction: column; gap: 14px; }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-group label { font-size: 12px; font-weight: 700; color: var(--text-muted); }
    .form-control {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: var(--radius-md);
      color: #fff;
      padding: 8px 12px;
      font-size: 13px;
    }

    .modal-footer {
      padding: 14px 20px;
      border-top: 1px solid var(--border-gold-subtle);
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }
  `]
})
export class MeetingsComponent implements OnInit {
  meetings: Meeting[] = [];
  showModal = false;

  meetForm = {
    meetingName: '',
    defaultDurationHours: 1.0,
    description: ''
  };

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadMeetings();
  }

  get totalMeetingHours(): number {
    return this.meetings.reduce((sum, m) => sum + (m.defaultDurationHours || 0), 0);
  }

  get avgMeetingDuration(): number {
    return this.meetings.length > 0 ? this.totalMeetingHours / this.meetings.length : 0;
  }

  loadMeetings() {
    this.api.getMeetings().subscribe(res => {
      this.meetings = res.data || [];
    });
  }

  openCreateModal() {
    this.meetForm = {
      meetingName: '',
      defaultDurationHours: 1.0,
      description: ''
    };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.closeModal();
    }
  }

  saveMeeting() {
    if (!this.meetForm.meetingName.trim()) {
      alert('Please enter a meeting title.');
      return;
    }

    this.api.createMeeting({
      meetingName: this.meetForm.meetingName.trim(),
      defaultDurationHours: Number(this.meetForm.defaultDurationHours || 1.0),
      description: this.meetForm.description
    }).subscribe(() => {
      this.closeModal();
      this.loadMeetings();
    });
  }

  deleteMeeting(id: number) {
    if (confirm('Are you sure you want to delete this meeting master?')) {
      const all: Meeting[] = JSON.parse(localStorage.getItem('dwpts_meetings') || '[]');
      const filtered = all.filter(m => m.meetingId !== id);
      localStorage.setItem('dwpts_meetings', JSON.stringify(filtered));
      this.loadMeetings();
    }
  }
}
