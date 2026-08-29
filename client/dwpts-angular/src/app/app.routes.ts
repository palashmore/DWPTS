import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'daily-work',
        loadComponent: () => import('./features/daily-work/daily-work.component').then(m => m.DailyWorkComponent)
      },
      {
        path: 'work-entries',
        loadComponent: () => import('./features/work-entries/work-entries.component').then(m => m.WorkEntriesComponent)
      },
      {
        path: 'work-items',
        loadComponent: () => import('./features/work-items/work-items.component').then(m => m.WorkItemsComponent)
      },
      {
        path: 'calendar',
        loadComponent: () => import('./features/calendar/calendar.component').then(m => m.CalendarComponent)
      },
      {
        path: 'meetings',
        loadComponent: () => import('./features/meetings/meetings.component').then(m => m.MeetingsComponent)
      },
      {
        path: 'categories',
        loadComponent: () => import('./features/categories/categories.component').then(m => m.CategoriesComponent)
      },
      {
        path: 'holidays',
        loadComponent: () => import('./features/holidays/holidays.component').then(m => m.HolidaysComponent)
      },
      {
        path: 'leaves',
        loadComponent: () => import('./features/leaves/leaves.component').then(m => m.LeavesComponent)
      },
      {
        path: 'reports',
        loadComponent: () => import('./features/reports/reports.component').then(m => m.ReportsComponent)
      },
      {
        path: 'import',
        loadComponent: () => import('./features/import/import.component').then(m => m.ImportComponent)
      },
      {
        path: 'admin',
        loadComponent: () => import('./features/admin/admin.component').then(m => m.AdminComponent)
      },
      {
        path: 'monitoring',
        loadComponent: () => import('./features/monitoring/monitoring.component').then(m => m.MonitoringComponent)
      },
      {
        path: 'ai-assistant',
        loadComponent: () => import('./features/ai-assistant/ai-assistant.component').then(m => m.AIAssistantComponent)
      },
      {
        path: 'knowledge',
        loadComponent: () => import('./features/knowledge/knowledge.component').then(m => m.KnowledgeComponent)
      }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
