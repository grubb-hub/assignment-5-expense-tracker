import { Component, OnInit, OnDestroy, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirebaseService } from '../firebase.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-transactions-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './transactions-list.html',
  styleUrl: './transactions-list.css',
})
export class TransactionsListComponent implements OnInit, OnDestroy {
  transactions: any[] = [];
  loading = true;
  private unsubscribeTransactions: (() => void) | null = null;

  constructor(
    private firebaseService: FirebaseService,
    private router: Router,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.setupTransactionsListener();
  }

  ngOnDestroy() {
    // Clean up the listener when component is destroyed
    if (this.unsubscribeTransactions) {
      this.unsubscribeTransactions();
    }
  }

  setupTransactionsListener() {
    console.log('Setting up transactions listener...');

    // Listen for auth state changes
    this.firebaseService.auth.onAuthStateChanged((user) => {
      console.log('Auth state changed, user:', user);

      // Clean up existing listener
      if (this.unsubscribeTransactions) {
        console.log('Cleaning up existing listener');
        this.unsubscribeTransactions();
        this.unsubscribeTransactions = null;
      }

      if (!user) {
        console.log('No user, redirecting to auth');
        this.ngZone.run(() => {
          this.transactions = [];
          this.loading = false;
        });
        this.router.navigate(['/auth']);
        return;
      }

      console.log('Setting up new transactions listener for user:', user.uid);

      // Set up real-time listener for this user
      this.unsubscribeTransactions = this.firebaseService.getTransactions((transactions) => {
        console.log('Real-time update: received', transactions.length, 'transactions');
        this.ngZone.run(() => {
          this.transactions = transactions;
          this.loading = false;
          this.cdr.detectChanges();
        });
      });
    });
  }

  goToAddTransaction() {
    this.router.navigate(['/transaction']);
  }

  refreshTransactions() {
    console.log('Manual refresh triggered');
    this.loading = true;
    // The real-time listener should automatically update, but this forces a refresh
    setTimeout(() => {
      if (this.unsubscribeTransactions) {
        this.unsubscribeTransactions();
      }
      this.setupTransactionsListener();
    }, 100);
  }

  logout() {
    this.firebaseService.logout();
    this.router.navigate(['/auth']);
  }

  trackByTransactionId(index: number, transaction: any): string {
    return transaction.id;
  }

  getTotalAmount(): number {
    return this.transactions.reduce((total, transaction) => total + (transaction.amount || 0), 0);
  }
}
