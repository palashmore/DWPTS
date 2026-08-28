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
          <h2>Meeting Management & Analytics</h2>
          <p class="subtitle">Configurable meeting types, occurrences and total effort analysis</p>
        </div>
        <button class="btn btn-primary" (click)="openCreate()">+ Add Meeting Master</button>
      </div>

      <div class="dwpts-card">
        <div class="card-header">
          <h3>Meeting Effort Analysis</h3>
          <span class="subtitle">Cumulative meeting hours across all work entries</span>
        </div>

        <div class="dwpts-table-container">
          <table class="dwpts-table">
            <thead>
              <tr>
                <th>Meeting Name</th>
                <th>Total Hours</th>
                <th>Occurrences</th>
                <th>Avg Duration</th>
                <th>% of Total Meetings</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let a of analysis">
                <td><strong>{{ a.meetingName }}</strong></td>
                <td><strong>{{ a.totalHours }}h</strong></td>
                <td>{{ a.occurrencesCount }} times</td>
                <td>{{ a.averageDurationHours }}h</td>
                <td><span class="badge status-inprogress">{{ a.percentageOfTotalEffort }}%</span></td>
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
export class MeetingsComponent implements OnInit {
  meetings: Meeting[] = [];
  analysis: MeetingAnalysis[] = [];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getMeetings().subscribe(res => this.meetings = res.data || []);
    this.api.getMeetingAnalysis().subscribe(res => this.analysis = res.data || []);
  }

  openCreate() {
    const name = prompt('Enter Meeting Name:');
    if (name) {
      this.api.getMeetings();
    }
  }
}
