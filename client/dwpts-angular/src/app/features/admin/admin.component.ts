import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-page">
      <!-- Floating Toast Notification -->
      <div class="toast-notification" *ngIf="toastMessage" [ngClass]="toastType">
        <span class="toast-icon">{{ toastType === 'success' ? '✅' : '❌' }}</span>
        <div class="toast-content">
          <span class="toast-title">{{ toastType === 'success' ? 'Success' : 'Error' }}</span>
          <span class="toast-text">{{ toastMessage }}</span>
        </div>
      </div>

      <div class="page-title-row">
        <div>
          <h2>System Administration & User Management</h2>
          <p class="subtitle">Manage user accounts, roles, system parameters, and audit trails</p>
        </div>
        <button class="btn btn-primary btn-pill cta-glow" (click)="openUserModal()">
          <span>+ Create New User & Employee</span>
        </button>
      </div>

      <!-- User & Employee Accounts -->
      <div class="dwpts-card">
        <div class="card-header">
          <div>
            <h3>Active User & Employee Directory ({{ employees.length }})</h3>
            <span class="subtitle">System users, authorization roles, and daily capacity limits</span>
          </div>
          <button class="btn btn-secondary btn-sm btn-pill" (click)="loadData()">🔄 Refresh</button>
        </div>

        <div class="dwpts-table-container">
          <table class="dwpts-table">
            <thead>
              <tr>
                <th>EMP CODE</th>
                <th>FULL NAME</th>
                <th>DEPARTMENT</th>
                <th>DESIGNATION</th>
                <th>DAILY CAPACITY</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let emp of employees">
                <td><span class="mono-badge">{{ emp.employeeCode }}</span></td>
                <td><strong>{{ emp.fullName }}</strong></td>
                <td>{{ emp.department || '-' }}</td>
                <td>{{ emp.designation || '-' }}</td>
                <td><strong>{{ emp.dailyCapacityHours }} hrs / day</strong></td>
                <td><span class="badge status-completed">{{ emp.isActive ? 'Active' : 'Inactive' }}</span></td>
              </tr>
              <tr *ngIf="employees.length === 0">
                <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 24px;">No employees loaded.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- System Settings -->
      <div class="dwpts-card">
        <div class="card-header">
          <div>
            <h3>System Parameters & Settings</h3>
            <span class="subtitle">Application rules, default capacity, and workflow limits</span>
          </div>
        </div>
        <div class="dwpts-table-container">
          <table class="dwpts-table">
            <thead>
              <tr>
                <th>SETTING KEY</th>
                <th>VALUE</th>
                <th>DESCRIPTION</th>
                <th>DATA TYPE</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let s of settings">
                <td><strong>{{ s.key }}</strong></td>
                <td><span class="mono-badge">{{ s.value }}</span></td>
                <td>{{ s.description }}</td>
                <td><span class="badge status-inprogress">{{ s.dataType }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Security Audit Log Trail -->
      <div class="dwpts-card">
        <div class="card-header">
          <div>
            <h3>Security & Change Audit Trail</h3>
            <span class="subtitle">Immutable record of changes, actions, and timestamps</span>
          </div>
        </div>
        <div class="dwpts-table-container">
          <table class="dwpts-table">
            <thead>
              <tr>
                <th>TIMESTAMP</th>
                <th>USER</th>
                <th>ACTION</th>
                <th>ENTITY</th>
                <th>ENTITY ID</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let a of auditLogs">
                <td>{{ a.timestamp | date:'medium' }}</td>
                <td><strong>{{ a.username || 'System' }}</strong></td>
                <td><span class="badge status-completed">{{ a.action }}</span></td>
                <td>{{ a.entityName }}</td>
                <td>{{ a.entityId || '-' }}</td>
              </tr>
              <tr *ngIf="auditLogs.length === 0">
                <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 20px;">No audit events recorded yet.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Create New User Modal -->
      <div class="modal-backdrop" *ngIf="showUserModal" (click)="onBackdropClick($event)">
        <div class="modal-dialog">
          <div class="modal-header-hero">
            <div>
              <h3>Create New User & Employee Account</h3>
              <span class="modal-date-tag">👤 Provisions login credentials and employee profile</span>
            </div>
            <button class="modal-close-button" (click)="closeUserModal()">×</button>
          </div>

          <form (ngSubmit)="saveUser()" class="modal-form">
            <div class="form-section-title">LOGIN CREDENTIALS</div>
            <div class="form-row-2">
              <div class="form-group">
                <label>Username *</label>
                <input type="text" [(ngModel)]="userForm.username" name="username" placeholder="e.g. john.doe" required />
              </div>
              <div class="form-group">
                <label>Corporate Email *</label>
                <input type="email" [(ngModel)]="userForm.email" name="email" placeholder="e.g. john@company.com" required />
              </div>
            </div>

            <div class="form-row-2">
              <div class="form-group">
                <label>Password *</label>
                <input type="password" [(ngModel)]="userForm.password" name="password" placeholder="••••••••" required />
              </div>
              <div class="form-group">
                <label>Role *</label>
                <select [(ngModel)]="userForm.role" name="role">
                  <option value="EMPLOYEE">Employee (Standard Access)</option>
                  <option value="MANAGER">Manager (Team Oversight)</option>
                  <option value="ADMIN">Admin (Full System Access)</option>
                </select>
              </div>
            </div>

            <div class="form-section-title">EMPLOYEE PROFILE DETAILS</div>
            <div class="form-row-2">
              <div class="form-group">
                <label>First Name *</label>
                <input type="text" [(ngModel)]="userForm.firstName" name="firstName" placeholder="John" required />
              </div>
              <div class="form-group">
                <label>Last Name *</label>
                <input type="text" [(ngModel)]="userForm.lastName" name="lastName" placeholder="Doe" required />
              </div>
            </div>

            <div class="form-row-2">
              <div class="form-group">
                <label>Department</label>
                <input type="text" [(ngModel)]="userForm.department" name="department" placeholder="Engineering / QA" />
              </div>
              <div class="form-group">
                <label>Designation</label>
                <input type="text" [(ngModel)]="userForm.designation" name="designation" placeholder="Senior Developer" />
              </div>
            </div>

            <div class="modal-footer-actions">
              <button type="button" class="btn btn-secondary btn-pill" (click)="closeUserModal()">Cancel</button>
              <button type="submit" class="btn btn-primary btn-pill cta-glow" [disabled]="isSaving">
                {{ isSaving ? 'Provisioning...' : 'Create User Account' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-title-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .cta-glow { box-shadow: var(--gold-glow-subtle); }

    /* Modal */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(2, 8, 23, 0.85);
      backdrop-filter: blur(10px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: modalFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .modal-dialog {
      background: #101E33;
      border-radius: var(--radius-xl);
      width: 100%;
      max-width: 600px;
      padding: 28px;
      box-shadow: var(--shadow-modal);
      border: 1px solid var(--border-primary);
    }
    .modal-header-hero {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
      h3 { font-size: 18px; font-weight: 800; color: #F8FAFC; }
    }
    .modal-date-tag { font-size: 12px; color: var(--gold-highlight); font-weight: 600; }
    .modal-close-button {
      background: transparent;
      border: none;
      font-size: 24px;
      color: var(--text-muted);
      cursor: pointer;
      &:hover { color: #FFF; }
    }
    .form-section-title {
      font-size: 10.5px;
      font-weight: 800;
      color: var(--gold-highlight);
      letter-spacing: 0.08em;
      margin: 14px 0 8px;
    }
    .form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .modal-footer-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 24px; }

    /* Toast */
    .toast-notification {
      position: fixed;
      top: 24px;
      right: 24px;
      z-index: 2000;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 20px;
      border-radius: var(--radius-lg);
      box-shadow: 0 10px 30px rgba(0,0,0,0.7);
      animation: slideInToast 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .toast-notification.success { background: #101E33; border-left: 5px solid #34D399; border: 1px solid var(--border-primary); }
    .toast-notification.error { background: #101E33; border-left: 5px solid #F87171; border: 1px solid var(--border-primary); }
    .toast-icon { font-size: 20px; }
    .toast-content { display: flex; flex-direction: column; }
    .toast-title { font-size: 13px; font-weight: 800; color: #F8FAFC; }
    .toast-text { font-size: 12.5px; color: var(--text-platinum); }

    @keyframes modalFadeIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
    @keyframes slideInToast { from { transform: translateY(-20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  `]
})
export class AdminComponent implements OnInit {
  employees: any[] = [];
  settings: any[] = [];
  auditLogs: any[] = [];

  showUserModal = false;
  isSaving = false;

  toastMessage: string | null = null;
  toastType: 'success' | 'error' = 'success';
  private toastTimer: any = null;

  userForm = {
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    department: 'Engineering',
    designation: 'Software Engineer',
    role: 'EMPLOYEE'
  };

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.api.getEmployees().subscribe(res => this.employees = res.data || []);
    this.api.getSystemSettings().subscribe(res => this.settings = res.data || []);
    this.api.getAuditLogs().subscribe(res => this.auditLogs = res.data?.items || []);
  }

  showToast(msg: string, type: 'success' | 'error' = 'success') {
    this.toastMessage = msg;
    this.toastType = type;
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toastMessage = null, 4000);
  }

  openUserModal() {
    this.userForm = {
      username: '',
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      department: 'Engineering',
      designation: 'Software Engineer',
      role: 'EMPLOYEE'
    };
    this.showUserModal = true;
  }

  closeUserModal() {
    this.showUserModal = false;
    this.isSaving = false;
  }

  onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.closeUserModal();
    }
  }

  saveUser() {
    if (!this.userForm.username || !this.userForm.password || !this.userForm.email || !this.userForm.firstName || !this.userForm.lastName) {
      this.showToast('Please fill in all required fields.', 'error');
      return;
    }

    this.isSaving = true;
    this.api.registerUser(this.userForm).subscribe({
      next: res => {
        this.isSaving = false;
        if (res.success) {
          this.showToast('User & Employee created successfully in database!', 'success');
          this.closeUserModal();
          this.loadData();
        } else {
          this.showToast(res.message || 'Creation failed', 'error');
        }
      },
      error: err => {
        this.isSaving = false;
        this.showToast(err.error?.message || 'Server error creating user', 'error');
      }
    });
  }
}
