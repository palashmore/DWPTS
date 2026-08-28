import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { Holiday } from '../../core/models/models';

@Component({
  selector: 'app-holidays',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="holidays-page">
      <div class="page-title-row">
        <div>
          <h2>Holiday Calendar</h2>
          <p class="subtitle">Company and public holidays recognized across calendar and daily planning</p>
        </div>
      </div>

      <div class="dwpts-card">
        <div class="dwpts-table-container">
          <table class="dwpts-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Holiday Name</th>
                <th>Type</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let h of holidays">
                <td><strong>{{ h.holidayDate | date:'yyyy-MM-dd' }}</strong></td>
                <td>{{ h.holidayName }}</td>
                <td><span class="badge status-holiday">{{ h.holidayType }}</span></td>
                <td>{{ h.description || '-' }}</td>
              </tr>
              <tr *ngIf="holidays.length === 0">
                <td colspan="4" style="text-align: center; color: #94a3b8; padding: 24px;">No holidays configured for this year.</td>
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
export class HolidaysComponent implements OnInit {
  holidays: Holiday[] = [];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getHolidays().subscribe(res => this.holidays = res.data || []);
  }
}
