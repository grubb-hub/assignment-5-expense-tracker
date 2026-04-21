import { Routes } from '@angular/router';
import { AuthComponent } from './auth/auth';
import { TransactionComponent } from './transaction/transaction';
import { TransactionsListComponent } from './transactions-list/transactions-list';

export const routes: Routes = [
  { path: '', redirectTo: '/auth', pathMatch: 'full' },
  { path: 'auth', component: AuthComponent },
  { path: 'transaction', component: TransactionComponent },
  { path: 'transactions', component: TransactionsListComponent },
  { path: '**', redirectTo: '/auth' }
];
