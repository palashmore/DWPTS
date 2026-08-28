import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ImportPreview, ImportResult } from '../../core/models/models';

@Component({
  selector: 'app-import',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="import-page">
      <div class="page-title-row">
        <div>
          <h2>Excel Data Import & Normalization</h2>
          <p class="subtitle">Import historical "Daily Task Planning.xlsx" workbook with automatic sheet detection & normalization</p>
        </div>
      </div>

      <!-- Upload Box -->
      <div class="dwpts-card upload-card" *ngIf="!preview">
        <div class="drop-zone" (click)="fileInput.click()">
          <span class="upload-icon">📁</span>
          <h3>Click or Drag & Drop Excel Workbook</h3>
          <p>Supports .xlsx files with monthly sheets, AllData, and multi-row task entries</p>
          <input type="file" #fileInput (change)="onFileSelected($event)" accept=".xlsx,.xls" style="display: none" />
        </div>
        <div *ngIf="isUploading" class="upload-loading">
          <span class="spinner-dot"></span>
          Processing and analyzing workbook sheets...
        </div>
      </div>

      <!-- Preview Section -->
      <div *ngIf="preview">
        <div class="dwpts-card">
          <div class="card-header">
            <div>
              <h3>Import Preview: {{ preview.fileName }}</h3>
              <span class="subtitle">{{ preview.totalSheets }} Sheets detected: {{ preview.detectedSheets.join(', ') }}</span>
            </div>
            <div class="import-actions">
              <button class="btn btn-secondary btn-pill" (click)="preview = null">Cancel</button>
              <button class="btn btn-primary btn-pill cta-glow" [disabled]="isImporting" (click)="confirmImport()">
                {{ isImporting ? 'Importing...' : 'Confirm & Import (' + preview.totalRows + ' rows)' }}
              </button>
            </div>
          </div>

          <div class="kpi-grid">
            <div class="kpi-card">
              <span class="kpi-label">Total Rows</span>
              <span class="kpi-value">{{ preview.totalRows }}</span>
            </div>
            <div class="kpi-card">
              <span class="kpi-label">Valid Entries</span>
              <span class="kpi-value" style="color: #34D399;">{{ preview.validRows }}</span>
            </div>
            <div class="kpi-card">
              <span class="kpi-label">Warnings</span>
              <span class="kpi-value" style="color: #FBBF24;">{{ preview.warningRows }}</span>
            </div>
            <div class="kpi-card">
              <span class="kpi-label">Duplicates</span>
              <span class="kpi-value" style="color: #F87171;">{{ preview.duplicateRows }}</span>
            </div>
          </div>

          <div class="dwpts-table-container">
            <table class="dwpts-table">
              <thead>
                <tr>
                  <th>Sheet</th>
                  <th>Row</th>
                  <th>Date</th>
                  <th>Raw Task</th>
                  <th>Normalized Task #</th>
                  <th>Category</th>
                  <th>Meeting</th>
                  <th>Work (h)</th>
                  <th>Meeting (h)</th>
                  <th>Total (h)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let r of preview.previewRows.slice(0, 100)">
                  <td>{{ r.sheetName }}</td>
                  <td>{{ r.rowIndex }}</td>
                  <td>{{ r.date ? (r.date | date:'yyyy-MM-dd') : 'Missing' }}</td>
                  <td><div style="max-width: 260px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">{{ r.rawTask }}</div></td>
                  <td><span class="mono-badge">{{ r.normalizedTaskNumber || '-' }}</span></td>
                  <td>{{ r.category || '-' }}</td>
                  <td>{{ r.meeting || '-' }}</td>
                  <td>{{ r.workEffort }}h</td>
                  <td>{{ r.meetingEffort }}h</td>
                  <td><strong>{{ r.totalEffort }}h</strong></td>
                  <td><span class="badge" [ngClass]="{'status-completed': r.status === 'Valid', 'status-ongoing': r.status === 'Warning', 'status-holiday': r.status === 'Error'}">{{ r.status }}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
          <p style="font-size: 11px; color: var(--text-muted); margin-top: 12px;">Showing first 100 rows preview of {{ preview.totalRows }} total records.</p>
        </div>
      </div>

      <!-- Result Section -->
      <div class="dwpts-card result-card" *ngIf="importResult">
        <div class="result-header">
          <span class="result-icon">✅</span>
          <div>
            <h3>Import Completed Successfully!</h3>
            <p>Processed {{ importResult.totalProcessed }} rows: {{ importResult.importedCount }} imported, {{ importResult.skippedCount }} skipped.</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-title-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .drop-zone {
      border: 2px dashed var(--border-gold);
      border-radius: var(--radius-lg);
      padding: 56px 24px;
      text-align: center;
      cursor: pointer;
      background: var(--bg-navy-deep);
      transition: var(--transition-smooth);
      &:hover { border-color: var(--gold-highlight); background: var(--bg-surface-elevated); }
    }
    .upload-icon { font-size: 48px; display: block; margin-bottom: 12px; }
    .upload-loading { text-align: center; padding: 18px; font-weight: 700; color: var(--gold-highlight); }
    .import-actions { display: flex; gap: 10px; }
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 20px; }
    .kpi-card { background: var(--bg-navy-deep); padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); display: flex; flex-direction: column; }
    .kpi-label { font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; }
    .kpi-value { font-size: 22px; font-weight: 800; color: var(--text-primary); margin-top: 4px; }
    .result-card { background: rgba(52, 211, 153, 0.12); border-color: rgba(52, 211, 153, 0.3); }
    .result-header { display: flex; align-items: center; gap: 16px; }
    .result-icon { font-size: 32px; }
    .cta-glow { box-shadow: var(--gold-glow-subtle); }
  `]
})
export class ImportComponent {
  isUploading = false;
  isImporting = false;
  preview: ImportPreview | null = null;
  importResult: ImportResult | null = null;

  constructor(private api: ApiService) {}

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.isUploading = true;
      this.importResult = null;
      this.api.previewExcel(file).subscribe({
        next: res => {
          this.isUploading = false;
          if (res.success && res.data) {
            this.preview = res.data;
          } else {
            alert('Preview error: ' + (res.message || 'Unknown error'));
          }
        },
        error: err => {
          this.isUploading = false;
          alert('Failed to preview Excel: ' + (err.error?.message || err.message));
        }
      });
    }
  }

  confirmImport() {
    if (!this.preview) return;
    this.isImporting = true;
    this.api.confirmImport({ rowsToImport: this.preview.previewRows }).subscribe({
      next: res => {
        this.isImporting = false;
        if (res.success && res.data) {
          this.importResult = res.data;
          this.preview = null;
        } else {
          alert('Import error: ' + (res.message || 'Import failed'));
        }
      },
      error: err => {
        this.isImporting = false;
        alert('Import failed: ' + (err.error?.message || err.message));
      }
    });
  }
}
