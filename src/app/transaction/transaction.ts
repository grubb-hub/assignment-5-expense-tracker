import { Component, signal, computed, OnInit, OnDestroy, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FirebaseService } from '../firebase.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

interface Transaction {
  id?: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  type: 'income' | 'expense';
  userId?: string;
}

@Component({
  selector: 'app-transaction',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './transaction.html',
  styleUrl: './transaction.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionComponent implements OnInit, OnDestroy {
  private firebaseService = inject(FirebaseService);
  private router = inject(Router);

  // ============ SIGNAL STATE ============
  transactions = signal<Transaction[]>([]);
  loading = signal(true);
  isEditing = signal(false);
  selectedTransaction = signal<Transaction | null>(null);
  deleting = signal<string | null>(null);
  
  // Derived state
  hasTransactions = computed(() => this.transactions().length > 0);

  private unsubscribe: any;

  // ============ FORM MODEL ============
  transaction = signal<Transaction>({
    amount: 0,
    description: '',
    category: '',
    date: this.getTodayDate(),
    type: 'expense'
  });

  // ============ LIFECYCLE ============
  ngOnInit() {
    this.unsubscribe = this.firebaseService.getTransactions((data: Transaction[]) => {
      this.transactions.set(data);
      this.loading.set(false);
    });
  }

  ngOnDestroy() {
    if (this.unsubscribe) this.unsubscribe();
  }

  // ============ HELPERS ============
  private getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  private resetForm(): void {
    this.transaction.set({
      amount: 0,
      description: '',
      category: '',
      date: this.getTodayDate(),
      type: 'expense'
    });
  }

  // ============ CREATE ============
  async addTransaction() {
    try {
      await this.firebaseService.addTransaction(this.transaction());
      alert('Transaction added successfully!');
      this.resetForm();
    } catch (error) {
      console.error('Error adding transaction:', error);
      alert('Error adding transaction');
    }
  }

  // ============ READ ============
  // (Real-time via ngOnInit and firebaseService)

  // ============ UPDATE ============
  startEdit(tx: Transaction) {
    this.selectedTransaction.set({ ...tx });
    this.isEditing.set(true);
  }

  async saveEdit() {
    const selected = this.selectedTransaction();
    if (!selected || !selected.id) return;

    try {
      await this.firebaseService.updateTransaction(selected.id, selected);
      
      this.transactions.update(list =>
        list.map(t => t.id === selected.id ? selected : t)
      );

      this.cancelEdit();
      alert('Transaction updated successfully!');
    } catch (error) {
      console.error('Error updating transaction:', error);
      alert('Error updating transaction');
    }
  }

  cancelEdit(): void {
    this.selectedTransaction.set(null);
    this.isEditing.set(false);
  }

  // ============ DELETE ============
  async deleteTransaction(id: string) {
    if (!confirm('Are you sure you want to delete this transaction?')) return;

    try {
      this.deleting.set(id);
      await this.firebaseService.deleteTransaction(id);
      
      this.transactions.update(list =>
        list.filter(t => t.id !== id)
      );
      
      alert('Transaction deleted successfully!');
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Error deleting transaction');
    } finally {
      this.deleting.set(null);
    }
  }

  // ============ NAVIGATION ============
  viewTransactions() {
    this.router.navigate(['/transactions']);
  }

  logout() {
    this.firebaseService.logout();
    this.router.navigate(['/auth']);
  }
}
