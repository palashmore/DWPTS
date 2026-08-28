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
          <h2>Leave Management</h2>
          <p class="subtitle">Apply for leave and track approval status</p>
        </div>
        <button class="btn btn-primary" (click)="openApplyModal()">+ Apply Leave</button>
      </div>

      <div class="dwpts-card">
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
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let l of leaves">
                <td><strong>{{ l.employeeName }}</strong></td>
                <td>{{ l.leaveTypeName }}</td>
                <td>{{ l.fromDate | date:'yyyy-MM-dd' }}</td>
                <td>{{ l.toDate | date:'yyyy-MM-dd' }}</td>
                <td>{{ l.durationDays }} days ({{ l.durationHours }}h)</td>
                <td>{{ l.reason || '-' }}</td>
                <td><span class="badge" [ngClass]="{'status-completed': l.status === 'Approved', 'status-ongoing': l.status === 'Pending', 'status-holiday': l.status === 'Rejected'}">{{ l.status }}</span></td>
              </tr>
              <tr *ngIf="leaves.length === 0">
                <td colspan="7" style="text-align: center; color: #94a3b8; padding: 24px;">No leave requests found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-title-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
  `]
})
export class LeavesComponent implements OnInit {
  leaves: Leave[] = [];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getLeaves().subscribe(res => this.leaves = res.data || []);
  }

  openApplyModal() {
    const reason = prompt('Enter Leave Reason:');
    if (reason) {
      const today = new Date().toISOString().substring(0, 10);
      this.api.applyLeave({ leaveTypeId: 1, fromDate: today, toDate: today, durationDays: 1, reason: reason }).subscribe(() => {
        this.api.getLeaves().subscribe(res => this.leaves = res.data || []);
      });
    }
  }
}
