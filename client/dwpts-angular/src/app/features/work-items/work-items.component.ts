import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { WorkItem, WorkItemTimeline, PagedResult } from '../../core/models/models';

@Component({
  selector: 'app-work-items',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="work-items-page">
      <div class="page-title-row">
        <div>
          <h2>Work Items Backlog & History</h2>
          <p class="subtitle">Normalized task registry, cumulative effort tracking and multi-day timelines</p>
        </div>
        <button class="btn btn-primary" (click)="openCreateModal()">+ Create Work Item</button>
      </div>

      <div class="dwpts-card">
        <div class="card-header">
          <h3>Work Items Backlog</h3>
          <input type="text" [(ngModel)]="searchTerm" (ngModelChange)="loadData()" placeholder="Filter task # or title..." style="padding: 6px 12px; border: 1px solid #cbd5e1; border-radius: 6px;" />
        </div>

        <div class="dwpts-table-container">
          <table class="dwpts-table">
            <thead>
              <tr>
                <th>Task Number</th>
                <th>Title</th>
                <th>Type</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Total Effort</th>
                <th>Days Worked</th>
                <th>First Worked</th>
                <th>Last Worked</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let w of result?.items">
                <td><strong>{{ w.workItemNumber }}</strong></td>
                <td>{{ w.title }}</td>
                <td><span class="badge status-inprogress">{{ w.workItemTypeName || 'Task' }}</span></td>
                <td><span class="badge status-completed">{{ w.status }}</span></td>
                <td>{{ w.priority }}</td>
                <td><strong>{{ w.totalEffortLoggedHours }}h</strong></td>
                <td>{{ w.daysWorkedCount }} days</td>
                <td>{{ w.firstWorkedDate ? (w.firstWorkedDate | date:'yyyy-MM-dd') : '-' }}</td>
                <td>{{ w.lastWorkedDate ? (w.lastWorkedDate | date:'yyyy-MM-dd') : '-' }}</td>
                <td>
                  <button class="btn btn-secondary btn-sm" (click)="viewTimeline(w.workItemId)">📅 Timeline</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Timeline Modal -->
      <div class="modal-backdrop" *ngIf="timeline">
        <div class="modal-dialog">
          <div class="modal-header">
            <h3>Timeline: {{ timeline.workItemNumber }} - {{ timeline.title }}</h3>
            <button class="close-btn" (click)="timeline = null">×</button>
          </div>
          <p style="font-size: 13px; color: #64748b; margin-bottom: 16px;">Total Logged Effort: <strong>{{ timeline.totalEffort }} hrs</strong></p>

          <div class="timeline-list">
            <div class="timeline-item" *ngFor="let t of timeline.timeline">
              <div class="timeline-date">{{ t.workDate | date:'mediumDate' }}</div>
              <div class="timeline-content">
                <span class="timeline-badge">{{ t.effortHours }} hrs</span>
                <span class="timeline-remarks">{{ t.remarks || 'Progress logged' }}</span>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="timeline = null">Close</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-title-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
    .modal-backdrop { position: fixed; inset: 0; background: rgba(15,23,42,0.6); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-dialog { background: #ffffff; border-radius: 10px; width: 100%; max-width: 540px; padding: 24px; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; }
    .close-btn { background: none; border: none; font-size: 20px; cursor: pointer; }
    .timeline-list { display: flex; flex-direction: column; gap: 10px; max-height: 300px; overflow-y: auto; }
    .timeline-item { display: flex; justify-content: space-between; align-items: center; padding: 10px; background: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0; }
    .timeline-date { font-weight: 600; font-size: 12.5px; color: #1e293b; }
    .timeline-badge { background: #dbeafe; color: #1d4ed8; padding: 2px 8px; border-radius: 4px; font-size: 11.5px; font-weight: 700; }
    .timeline-remarks { font-size: 12.5px; color: #64748b; margin-left: 8px; }
    .modal-footer { display: flex; justify-content: flex-end; margin-top: 16px; }
  `]
})
export class WorkItemsComponent implements OnInit {
  result: PagedResult<WorkItem> | null = null;
  searchTerm = '';
  timeline: WorkItemTimeline | null = null;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.api.getWorkItems({ searchTerm: this.searchTerm, pageNumber: 1, pageSize: 50 }).subscribe(res => {
      if (res.success && res.data) this.result = res.data;
    });
  }

  openCreateModal() {
    const num = prompt('Enter Work Item / Task Number:');
    if (num) {
      const title = prompt('Enter Title:');
      if (title) {
        this.api.createWorkItem({ workItemNumber: num, title: title }).subscribe(() => this.loadData());
      }
    }
  }

  viewTimeline(id: number) {
    this.api.getWorkItemTimeline(id).subscribe(res => {
      if (res.success && res.data) this.timeline = res.data;
    });
  }
}
