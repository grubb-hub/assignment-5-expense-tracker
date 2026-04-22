import { Component, OnInit, OnDestroy, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirebaseService } from '../firebase.service';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { CATEGORIES } from '../constants/categories';
@Component({
  selector: 'app-transactions-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule],
  templateUrl: './transactions-list.html',
  styleUrl: './transactions-list.css',
})
export class TransactionsListComponent implements OnInit, OnDestroy {

  transactions: any[] = [];
  loading = true;

  CATEGORIES = CATEGORIES;

  private unsubscribeTransactions: (() => void) | null = null;

  Math = Math;

  // ---------------- FILTER STATE ----------------
  searchText: string = '';
  selectedCategory: string = '';
  minAmount: number | null = null;
  maxAmount: number | null = null;
  startDate: string = '';
  endDate: string = '';

  constructor(
    private firebaseService: FirebaseService,
    private router: Router,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  // ---------------- CATEGORY COLOR ----------------
  getCategoryColor(category: string): string {
    const cat = CATEGORIES.find(c => c.value === category);
    return cat ? cat.color : '#999';
  }

  // ---------------- INIT ----------------
  ngOnInit() {
    this.setupTransactionsListener();
  }

  ngOnDestroy() {
    if (this.unsubscribeTransactions) {
      this.unsubscribeTransactions();
    }
  }

  // ---------------- REALTIME LISTENER ----------------
  setupTransactionsListener() {

    this.firebaseService.auth.onAuthStateChanged((user) => {

      if (this.unsubscribeTransactions) {
        this.unsubscribeTransactions();
        this.unsubscribeTransactions = null;
      }

      if (!user) {
        this.ngZone.run(() => {
          this.transactions = [];
          this.loading = false;
        });
        this.router.navigate(['/auth']);
        return;
      }

      this.unsubscribeTransactions = this.firebaseService.getTransactions((transactions) => {
        this.ngZone.run(() => {
          this.transactions = transactions;
          this.loading = false;
          this.cdr.detectChanges();
        });
      });
    });
  }

  // ---------------- FILTER LOGIC ----------------
  getFilteredTransactions() {
    return this.transactions.filter((t) => {

      const matchesSearch =
        !this.searchText ||
        t.description?.toLowerCase().includes(this.searchText.toLowerCase());

      const matchesCategory =
        !this.selectedCategory || t.category === this.selectedCategory;

      const matchesMin =
        this.minAmount === null || Math.abs(t.amount) >= this.minAmount;

      const matchesMax =
        this.maxAmount === null || Math.abs(t.amount) <= this.maxAmount;

      const txDate = t.date ? new Date(t.date) : null;

      const matchesStart =
        !this.startDate || (txDate && txDate >= new Date(this.startDate));

      const matchesEnd =
        !this.endDate || (txDate && txDate <= new Date(this.endDate));

      return (
        matchesSearch &&
        matchesCategory &&
        matchesMin &&
        matchesMax &&
        matchesStart &&
        matchesEnd
      );
    });
  }

  // ---------------- CLEAR FILTERS ----------------
  clearFilters() {
    this.searchText = '';
    this.selectedCategory = '';
    this.minAmount = null;
    this.maxAmount = null;
    this.startDate = '';
    this.endDate = '';
  }

  // ---------------- NAVIGATION ----------------
  goToAddTransaction() {
    this.router.navigate(['/expenses']);
  }

  logout() {
    this.firebaseService.logout();
    this.router.navigate(['/auth']);
  }

  // ---------------- HELPERS ----------------
  trackByTransactionId(index: number, transaction: any): string {
    return transaction.id;
  }

  getTotalAmount(): number {
    return this.getFilteredTransactions().reduce((total, t) => {
      if (t.type === 'income') return total + t.amount;
      if (t.type === 'expense') return total - t.amount;
      return total;
    }, 0);
  }

  getTypeColor(type?: string): string {
    if (type === 'income') return 'primary';
    if (type === 'expense') return 'warn';
    return 'basic';
  }

  getTypeLabel(type?: string): string {
    if (type === 'income') return 'Income';
    if (type === 'expense') return 'Expense';
    return 'Unknown';
  }
}