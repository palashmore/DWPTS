import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { Category } from '../../core/models/models';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="categories-page">
      <div class="page-title-row">
        <div>
          <h2>Work Categories Master</h2>
          <p class="subtitle">Dynamic category catalog loaded from database</p>
        </div>
      </div>

      <div class="dwpts-card">
        <div class="dwpts-table-container">
          <table class="dwpts-table">
            <thead>
              <tr>
                <th>Color</th>
                <th>Category Name</th>
                <th>Description</th>
                <th>Entries Logged</th>
                <th>Total Effort</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let c of categories">
                <td><span class="color-badge" [style.background]="c.colorCode || '#2563eb'"></span></td>
                <td><strong>{{ c.name }}</strong></td>
                <td>{{ c.description || '-' }}</td>
                <td>{{ c.totalEntriesCount }}</td>
                <td><strong>{{ c.totalEffortHours }}h</strong></td>
                <td><span class="badge status-completed">{{ c.isActive ? 'Active' : 'Inactive' }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-title-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .color-badge { width: 14px; height: 14px; border-radius: 50%; display: inline-block; }
  `]
})
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getCategories().subscribe(res => this.categories = res.data || []);
  }
}
