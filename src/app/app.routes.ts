import { Routes } from '@angular/router';
import { AuthComponent } from './auth/auth';
import { TransactionComponent } from './transaction/transaction';
import { TransactionsListComponent } from './transactions-list/transactions-list';
import { ExpensesComponent } from './expenses/expenses';

export const routes: Routes = [
  { path: '', redirectTo: '/auth', pathMatch: 'full' },
  { path: 'auth', component: AuthComponent },
  { path: 'transaction', component: TransactionComponent },
  { path: 'expenses', component: ExpensesComponent },
  { path: 'transactions', component: TransactionsListComponent },
  { path: '**', redirectTo: '/auth' }
];
