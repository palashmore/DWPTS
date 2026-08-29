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
          <p class="subtitle">Manage user accounts, passwords, permissions, roles, and audit trails</p>
        </div>
        <button class="btn btn-primary btn-pill cta-glow" (click)="openUserModal()">
          <span>+ Create New User & Employee</span>
        </button>
      </div>

      <!-- User & Employee Directory -->
      <div class="dwpts-card">
        <div class="card-header">
          <div>
            <h3>Active User & Employee Directory ({{ employees.length }})</h3>
            <span class="subtitle">System users, authorization roles, edit permissions, and action controls</span>
          </div>
          <button class="btn btn-secondary btn-sm btn-pill" (click)="loadData()">🔄 Refresh</button>
        </div>

        <div class="dwpts-table-container">
          <table class="dwpts-table">
            <thead>
              <tr>
                <th>EMP CODE</th>
                <th>FULL NAME</th>
                <th>USERNAME / EMAIL</th>
                <th>ROLE</th>
                <th>DEPARTMENT</th>
                <th>DESIGNATION</th>
                <th>DAILY CAPACITY</th>
                <th>STATUS</th>
                <th style="text-align: center; width: 140px;">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let emp of employees">
                <td><span class="mono-badge">{{ emp.employeeCode }}</span></td>
                <td><strong>{{ emp.fullName }}</strong></td>
                <td>
                  <span style="font-size: 12px; color: var(--gold-highlight);">&#64;{{ emp.username || emp.employeeCode }}</span>
                  <div style="font-size: 11px; color: var(--text-muted);">{{ emp.email || emp.username + '@company.com' }}</div>
                </td>
                <td>
                  <span class="badge" [ngClass]="emp.role === 'ADMIN' ? 'status-inprogress' : (emp.role === 'MANAGER' ? 'status-optimal' : 'status-completed')">
                    {{ emp.role || (emp.employeeCode === 'EMP001' ? 'ADMIN' : (emp.employeeCode === 'EMP002' ? 'MANAGER' : 'EMPLOYEE')) }}
                  </span>
                </td>
                <td>{{ emp.department || 'Engineering' }}</td>
                <td>{{ emp.designation || 'Software Engineer' }}</td>
                <td><strong>{{ emp.dailyCapacityHours || 8 }} hrs / day</strong></td>
                <td><span class="badge status-completed">{{ emp.isActive !== false ? 'Active' : 'Inactive' }}</span></td>
                <td style="text-align: center;">
                  <div class="action-btn-group" style="display: flex; gap: 6px; justify-content: center;">
                    <button class="btn btn-secondary btn-sm" style="padding: 4px 8px; font-size: 11px; border-radius: 6px;" (click)="openEditUser(emp)" title="Edit User, Permissions & Password">
                      ✏️ Edit
                    </button>
                    <button class="btn btn-danger btn-sm" style="padding: 4px 8px; font-size: 11px; border-radius: 6px;" (click)="deleteUser(emp)" title="Delete User">
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="employees.length === 0">
                <td colspan="9" style="text-align: center; color: var(--text-muted); padding: 24px;">No employees loaded.</td>
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

      <!-- Create / Edit User Modal -->
      <div class="modal-backdrop" *ngIf="showUserModal" (click)="onBackdropClick($event)">
        <div class="modal-dialog">
          <div class="modal-header-hero">
            <div>
              <h3>{{ editingEmpCode ? '✏️ Edit User, Permissions & Password' : '✨ Create New User & Employee Account' }}</h3>
              <span class="modal-date-tag">{{ editingEmpCode ? 'Modify account details, capacity, and credentials for ' + editingEmpCode : 'Provisions login credentials and employee profile' }}</span>
            </div>
            <button class="modal-close-button" (click)="closeUserModal()">×</button>
          </div>

          <form (ngSubmit)="saveUser()" class="modal-form">
            <div class="form-section-title">LOGIN CREDENTIALS & ACCESS ROLES</div>
            <div class="form-row-2">
              <div class="form-group">
                <label>Username *</label>
                <input type="text" [(ngModel)]="userForm.username" name="username" placeholder="e.g. pallavi or john.doe" required />
              </div>
              <div class="form-group">
                <label>Corporate Email *</label>
                <input type="email" [(ngModel)]="userForm.email" name="email" placeholder="e.g. pallavi@company.com" required />
              </div>
            </div>

            <div class="form-row-2">
              <div class="form-group">
                <label>Password {{ editingEmpCode ? '(Leave blank to keep unchanged)' : '*' }}</label>
                <input type="text" [(ngModel)]="userForm.password" name="password" placeholder="e.g. Password@123" />
              </div>
              <div class="form-group">
                <label>Access Role *</label>
                <select [(ngModel)]="userForm.role" name="role">
                  <option value="EMPLOYEE">Employee (Personal Work View)</option>
                  <option value="MANAGER">Manager (Team Oversight)</option>
                  <option value="ADMIN">Admin (Full System Access)</option>
                </select>
              </div>
            </div>

            <div class="form-section-title">EMPLOYEE PROFILE DETAILS</div>
            <div class="form-row-2" *ngIf="!editingEmpCode">
              <div class="form-group">
                <label>First Name *</label>
                <input type="text" [(ngModel)]="userForm.firstName" name="firstName" placeholder="Pallavi" required />
              </div>
              <div class="form-group">
                <label>Last Name *</label>
                <input type="text" [(ngModel)]="userForm.lastName" name="lastName" placeholder="More" required />
              </div>
            </div>

            <div class="form-group" *ngIf="editingEmpCode">
              <label>Full Name *</label>
              <input type="text" [(ngModel)]="userForm.fullName" name="fullName" placeholder="Pallavi More" required />
            </div>

            <div class="form-row-2">
              <div class="form-group">
                <label>Department</label>
                <input type="text" [(ngModel)]="userForm.department" name="department" placeholder="Engineering / QA" />
              </div>
              <div class="form-group">
                <label>Designation</label>
                <input type="text" [(ngModel)]="userForm.designation" name="designation" placeholder="Software Engineer" />
              </div>
            </div>

            <div class="form-row-2">
              <div class="form-group">
                <label>Daily Capacity Limit (Hours)</label>
                <input type="number" [(ngModel)]="userForm.dailyCapacityHours" name="dailyCapacityHours" step="0.5" min="1" max="24" />
              </div>
              <div class="form-group">
                <label>Account Status</label>
                <select [(ngModel)]="userForm.isActive" name="isActive">
                  <option [ngValue]="true">Active</option>
                  <option [ngValue]="false">Inactive (Suspended)</option>
                </select>
              </div>
            </div>

            <div class="modal-footer-actions">
              <button type="button" class="btn btn-secondary btn-pill" (click)="closeUserModal()">Cancel</button>
              <button type="submit" class="btn btn-primary btn-pill cta-glow" [disabled]="isSaving">
                {{ isSaving ? 'Saving...' : (editingEmpCode ? 'Update User Account' : 'Create User Account') }}
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
      background: var(--bg-surface);
      border-radius: var(--radius-xl);
      width: 100%;
      max-width: 620px;
      padding: 28px;
      box-shadow: var(--shadow-modal);
      border: 1px solid var(--border-gold);
    }
    .modal-header-hero {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
      h3 { font-size: 18px; font-weight: 800; color: var(--text-primary); }
    }
    .modal-date-tag { font-size: 12px; color: var(--gold-highlight); font-weight: 600; }
    .modal-close-button {
      background: transparent;
      border: none;
      font-size: 24px;
      color: var(--text-muted);
      cursor: pointer;
      &:hover { color: var(--text-primary); }
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
    .toast-notification.success { background: var(--bg-surface); border-left: 5px solid #34D399; border: 1px solid var(--border-primary); }
    .toast-notification.error { background: var(--bg-surface); border-left: 5px solid #F87171; border: 1px solid var(--border-primary); }
    .toast-icon { font-size: 20px; }
    .toast-content { display: flex; flex-direction: column; }
    .toast-title { font-size: 13px; font-weight: 800; color: var(--text-primary); }
    .toast-text { font-size: 12.5px; color: var(--text-platinum); }

    @keyframes modalFadeIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
    @keyframes slideInToast { from { transform: translateY(-20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

    @media (max-width: 768px) {
      .page-title-row { flex-direction: column; align-items: flex-start; gap: 10px; }
      .form-row-2 { grid-template-columns: 1fr; gap: 8px; }
      .modal-dialog { width: 94vw; max-width: 94vw; padding: 18px; max-height: 90vh; overflow-y: auto; }
      .modal-footer-actions { flex-direction: column-reverse; gap: 8px; }
      .modal-footer-actions button { width: 100%; }
    }
  `]
})
export class AdminComponent implements OnInit {
  employees: any[] = [];
  settings: any[] = [];
  auditLogs: any[] = [];

  showUserModal = false;
  editingEmpCode: string | null = null;
  isSaving = false;

  toastMessage: string | null = null;
  toastType: 'success' | 'error' = 'success';
  private toastTimer: any = null;

  userForm: any = {
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    fullName: '',
    department: 'Engineering',
    designation: 'Software Engineer',
    dailyCapacityHours: 8,
    isActive: true,
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

  resetAllData() {
    if (confirm('Are you sure you want to clear all old work entries and custom users? You can create fresh ones immediately.')) {
      this.api.clearAllRecords();
      this.loadData();
      this.showToast('All old records and tasks cleared successfully. Ready for fresh entries!', 'success');
    }
  }

  openUserModal() {
    this.editingEmpCode = null;
    this.userForm = {
      username: '',
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      fullName: '',
      department: 'Engineering',
      designation: 'Software Engineer',
      dailyCapacityHours: 8,
      isActive: true,
      role: 'EMPLOYEE'
    };
    this.showUserModal = true;
  }

  openEditUser(emp: any) {
    this.editingEmpCode = emp.employeeCode;
    this.userForm = {
      username: emp.username || emp.employeeCode.toLowerCase(),
      email: emp.email || (emp.username || emp.employeeCode.toLowerCase()) + '@company.com',
      password: emp.password || '',
      firstName: '',
      lastName: '',
      fullName: emp.fullName,
      department: emp.department || 'Engineering',
      designation: emp.designation || 'Software Engineer',
      dailyCapacityHours: emp.dailyCapacityHours || 8,
      isActive: emp.isActive !== false,
      role: emp.role || (emp.employeeCode === 'EMP001' ? 'ADMIN' : (emp.employeeCode === 'EMP002' ? 'MANAGER' : 'EMPLOYEE'))
    };
    this.showUserModal = true;
  }

  deleteUser(emp: any) {
    if (emp.employeeCode === 'EMP001') {
      this.showToast('Cannot delete primary Master Admin account.', 'error');
      return;
    }
    if (confirm(`Are you sure you want to delete user ${emp.fullName} (${emp.employeeCode})?`)) {
      this.api.deleteUser(emp.employeeCode).subscribe(() => {
        this.showToast(`User ${emp.fullName} deleted successfully!`, 'success');
        this.loadData();
      });
    }
  }

  closeUserModal() {
    this.showUserModal = false;
    this.editingEmpCode = null;
    this.isSaving = false;
  }

  onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.closeUserModal();
    }
  }

  saveUser() {
    if (!this.userForm.username || !this.userForm.email) {
      this.showToast('Please enter username and email.', 'error');
      return;
    }

    this.isSaving = true;

    if (this.editingEmpCode) {
      this.api.updateUser(this.editingEmpCode, this.userForm).subscribe({
        next: () => {
          this.isSaving = false;
          this.showToast('User permissions, password & profile updated successfully!', 'success');
          this.closeUserModal();
          this.loadData();
        },
        error: () => {
          this.isSaving = false;
          this.showToast('Failed to update user', 'error');
        }
      });
    } else {
      if (!this.userForm.password || !this.userForm.firstName || !this.userForm.lastName) {
        this.isSaving = false;
        this.showToast('Please fill in password, first name and last name.', 'error');
        return;
      }
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
}
