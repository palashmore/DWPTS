import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { WorkEntry, Category, PagedResult } from '../../core/models/models';

@Component({
  selector: 'app-work-entries',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="all-data-page">
      <div class="page-title-row">
        <div>
          <h2>All Work Entries (Excel AllData)</h2>
          <p class="subtitle">Complete historical repository with server-side filtering, search, and CSV export</p>
        </div>
        <button class="btn btn-primary btn-pill cta-glow" (click)="exportCsv()">📥 Export CSV</button>
      </div>

      <!-- Filters Bar -->
      <div class="dwpts-card filters-card">
        <div class="filters-grid">
          <div class="form-group" *ngIf="isAdmin">
            <label>Filter by Employee</label>
            <select [(ngModel)]="filter.employeeCode" (ngModelChange)="onFilterChange()">
              <option value="ALL">All Employees (Org-wide)</option>
              <option *ngFor="let emp of employees" [value]="emp.employeeCode">{{ emp.fullName }} ({{ emp.employeeCode }})</option>
            </select>
          </div>

          <div class="form-group">
            <label>Search</label>
            <input type="text" [(ngModel)]="filter.searchTerm" (ngModelChange)="onFilterChange()" placeholder="Task, description, remarks..." />
          </div>
          <div class="form-group">
            <label>From Date</label>
            <input type="date" [(ngModel)]="filter.fromDate" (ngModelChange)="onFilterChange()" />
          </div>
          <div class="form-group">
            <label>To Date</label>
            <input type="date" [(ngModel)]="filter.toDate" (ngModelChange)="onFilterChange()" />
          </div>
          <div class="form-group">
            <label>Category</label>
            <select [(ngModel)]="filter.categoryId" (ngModelChange)="onFilterChange()">
              <option [ngValue]="null">All Categories</option>
              <option *ngFor="let c of categories" [ngValue]="c.categoryId">{{ c.name }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Status</label>
            <select [(ngModel)]="filter.status" (ngModelChange)="onFilterChange()">
              <option value="">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="In Progress">In Progress</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Fixed">Fixed</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Entries Table -->
      <div class="dwpts-card">
        <div class="card-header">
          <div>
            <h3>Records ({{ result?.totalCount || 0 }} Total)</h3>
            <span class="subtitle">{{ isAdmin ? 'Viewing organization records' : 'Viewing your personal logged entries' }}</span>
          </div>
        </div>

        <div class="dwpts-table-container">
          <table class="dwpts-table">
            <thead>
              <tr>
                <th *ngIf="isAdmin">EMPLOYEE</th>
                <th>DATE</th>
                <th>TASK #</th>
                <th>DESCRIPTION</th>
                <th>CATEGORY</th>
                <th>MEETING</th>
                <th style="text-align: right;">MEETING (H)</th>
                <th style="text-align: right;">WORK (H)</th>
                <th style="text-align: right;">TOTAL (H)</th>
                <th>STATUS</th>
                <th>REMARKS</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let e of result?.items">
                <td *ngIf="isAdmin"><strong>{{ e.employeeName || 'User' }}</strong></td>
                <td>{{ e.workDate | date:'yyyy-MM-dd' }}</td>
                <td><span class="mono-badge">{{ e.taskNumber || '-' }}</span></td>
                <td>{{ e.description }}</td>
                <td><span class="badge" [style.background]="(e.categoryColor || '#60A5FA') + '20'" [style.color]="e.categoryColor || '#60A5FA'">{{ e.categoryName || 'Development' }}</span></td>
                <td>{{ e.meetingName || '-' }}</td>
                <td style="text-align: right;">{{ e.meetingEffortHours }}h</td>
                <td style="text-align: right;">{{ e.workEffortHours }}h</td>
                <td style="text-align: right;"><strong style="color: var(--text-gold);">{{ e.totalEffortHours }}h</strong></td>
                <td><span class="badge status-completed">{{ e.status }}</span></td>
                <td>{{ e.remarks || '-' }}</td>
              </tr>
              <tr *ngIf="result?.items?.length === 0">
                <td [attr.colspan]="isAdmin ? 11 : 10" style="text-align: center; color: var(--text-muted); padding: 28px;">
                  No work records found for this view.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-title-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
    .page-title-row h2 { font-size: 22px; font-weight: 800; color: var(--text-primary); }
    .subtitle { font-size: 13px; color: var(--text-muted); margin-top: 4px; }
    .filters-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 14px; }
    .cta-glow { box-shadow: var(--gold-glow-subtle); }
  `]
})
export class WorkEntriesComponent implements OnInit {
  filter: any = {
    employeeCode: 'ALL',
    searchTerm: '',
    fromDate: '',
    toDate: '',
    categoryId: null,
    status: '',
    pageNumber: 1,
    pageSize: 50
  };

  isAdmin = false;
  employees: any[] = [];
  result: PagedResult<WorkEntry> | null = null;
  categories: Category[] = [];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.isAdmin = this.api.isAdminOrManager();
    this.loadData();
    this.api.getCategories().subscribe(res => this.categories = res.data || []);
    if (this.isAdmin) {
      this.api.getEmployees().subscribe(res => this.employees = res.data || []);
    }
  }

  loadData() {
    this.api.getWorkEntries(this.filter).subscribe(res => {
      if (res.success && res.data) {
        this.result = res.data;
      }
    });
  }

  onFilterChange() {
    this.filter.pageNumber = 1;
    this.loadData();
  }

  exportCsv() {
    this.api.exportAllDataCsv(this.filter).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `AllData_Export_${new Date().toISOString().substring(0, 10)}.csv`;
      a.click();
    });
  }
}
