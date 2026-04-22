import { Routes } from '@angular/router';
import { AuthComponent } from './auth/auth';
import { TransactionComponent } from './transaction/transaction';
import { TransactionsListComponent } from './transactions-list/transactions-list';
import { DashboardComponent } from './dashboard/dashboard';
import { ProfileComponent } from './profile/profile';
import { AnalyticsComponent } from './analytics/analytics';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'analytics', component: AnalyticsComponent },
  { path: 'auth', component: AuthComponent },
  { path: 'transaction', component: TransactionComponent },
  { path: 'transactions', component: TransactionsListComponent },
  { path: 'profile', component: ProfileComponent },
  { path: '**', redirectTo: '/dashboard' }
];
