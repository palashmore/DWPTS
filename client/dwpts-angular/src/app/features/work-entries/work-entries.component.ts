import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { WorkEntry, Category, Meeting, PagedResult } from '../../core/models/models';

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
        <button class="btn btn-success" (click)="exportCsv()">📥 Export CSV</button>
      </div>

      <!-- Filters Bar -->
      <div class="dwpts-card filters-card">
        <div class="filters-grid">
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
          <h3>Records ({{ result?.totalCount || 0 }} Total)</h3>
          <span class="subtitle">Page {{ filter.pageNumber }} of {{ result?.totalPages || 1 }}</span>
        </div>

        <div class="dwpts-table-container">
          <table class="dwpts-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Day</th>
                <th>Task #</th>
                <th>Description</th>
                <th>Category</th>
                <th>Meeting</th>
                <th>Meeting (h)</th>
                <th>Work (h)</th>
                <th>Total (h)</th>
                <th>Status</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let e of result?.items">
                <td>{{ e.workDate | date:'yyyy-MM-dd' }}</td>
                <td>{{ e.dayName }}</td>
                <td><strong>{{ e.taskNumber || '-' }}</strong></td>
                <td>{{ e.description }}</td>
                <td><span class="badge" [style.background]="(e.categoryColor || '#3b82f6') + '20'" [style.color]="e.categoryColor || '#2563eb'">{{ e.categoryName || 'General' }}</span></td>
                <td>{{ e.meetingName || '-' }}</td>
                <td>{{ e.meetingEffortHours }}h</td>
                <td>{{ e.workEffortHours }}h</td>
                <td><strong>{{ e.totalEffortHours }}h</strong></td>
                <td><span class="badge status-completed">{{ e.status }}</span></td>
                <td>{{ e.remarks || '-' }}</td>
              </tr>
              <tr *ngIf="result?.items?.length === 0">
                <td colspan="11" style="text-align: center; color: #94a3b8; padding: 24px;">No records match the filter criteria.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="pagination-bar" *ngIf="result && result.totalPages > 1">
          <button class="btn btn-secondary btn-sm" [disabled]="!result.hasPreviousPage" (click)="goToPage(filter.pageNumber - 1)">◀ Previous</button>
          <span class="page-indicator">Page {{ result.pageNumber }} of {{ result.totalPages }}</span>
          <button class="btn btn-secondary btn-sm" [disabled]="!result.hasNextPage" (click)="goToPage(filter.pageNumber + 1)">Next ▶</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-title-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
    .filters-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 14px; }
    .pagination-bar { display: flex; align-items: center; justify-content: space-between; margin-top: 16px; padding-top: 14px; border-top: 1px solid #f1f5f9; }
    .page-indicator { font-size: 13px; font-weight: 600; color: #475569; }
  `]
})
export class WorkEntriesComponent implements OnInit {
  filter: any = {
    searchTerm: '',
    fromDate: '',
    toDate: '',
    categoryId: null,
    status: '',
    pageNumber: 1,
    pageSize: 25
  };

  result: PagedResult<WorkEntry> | null = null;
  categories: Category[] = [];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadData();
    this.api.getCategories().subscribe(res => this.categories = res.data || []);
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

  goToPage(page: number) {
    this.filter.pageNumber = page;
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
