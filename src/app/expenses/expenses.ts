import { Component, signal, OnInit, OnDestroy, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FirebaseService } from '../firebase.service';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { CATEGORIES } from '../constants/categories';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

interface Expense {
  amount: number;
  description: string;
  category: string;
  date: string;
  type: 'expense' | 'income';
}

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [FormsModule, MatButtonModule, CommonModule, MatSelectModule, MatFormFieldModule],
  templateUrl: './expenses.html',
  styleUrl: './expenses.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExpensesComponent {
  private firebaseService = inject(FirebaseService);
  private router = inject(Router);

  categories = CATEGORIES;

  // ============ FORM MODEL ============
  expense = signal<Expense>({
    amount: 0,
    description: '',
    category: '',
    date: this.getTodayDate(),
    type: 'expense'
  });

  // ============ HELPERS ============
  private getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  private resetForm(): void {
    this.expense.set({
      amount: 0,
      description: '',
      category: '',
      date: this.getTodayDate(),
      type: 'expense'
    });
  }

  // ============ CREATE ============
  async logAsExpense() {
    this.expense.update(e => ({ ...e, type: 'expense' }));
    await this.submitForm();
  }

  async logAsIncome() {
    this.expense.update(e => ({ ...e, type: 'income' }));
    await this.submitForm();
  }

private async submitForm() {
  try {
    const currentExpense = this.expense();

    const dataToSave: Expense = {
      ...currentExpense,
      amount: Number(currentExpense.amount),
      type: currentExpense.type
    };

    await this.firebaseService.addTransaction(dataToSave);

    const typeLabel =
      currentExpense.type === 'income' ? 'Income' : 'Expense';

    alert(`${typeLabel} added successfully!`);

    this.resetForm();
  } catch (error) {
    console.error('Error adding item:', error);
    alert('Error adding item');
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
