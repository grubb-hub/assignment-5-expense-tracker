import { Routes } from '@angular/router';
import { AuthComponent } from './auth/auth';
import { TransactionComponent } from './transaction/transaction';
import { TransactionsListComponent } from './transactions-list/transactions-list';
import { ExpensesComponent } from './expenses/expenses';
import { DashboardComponent } from './dashboard/dashboard';
import { ProfileComponent } from './profile/profile';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'auth', component: AuthComponent },
  { path: 'transaction', component: TransactionComponent },
  { path: 'expenses', component: ExpensesComponent },
  { path: 'transactions', component: TransactionsListComponent },
  { path: 'profile', component: ProfileComponent },
  { path: '**', redirectTo: '/dashboard' }
];
