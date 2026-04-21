import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FirebaseService } from '../firebase.service';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [FormsModule, MatButtonModule],
  templateUrl: './expenses.html',
  styleUrl: './expenses.css',
})
export class ExpensesComponent {
  expense = {
    amount: 0,
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    type: 'expense'
  };

  constructor(
    private firebaseService: FirebaseService,
    private router: Router
  ) {}

  async logAsExpense() {
    this.expense.type = 'expense';
    await this.submitForm();
  }

  async logAsTransaction() {
    this.expense.type = 'transaction';
    await this.submitForm();
  }

  private async submitForm() {
    try {
      // Make amount negative for expenses
      const dataToSave = {
        ...this.expense,
        amount: this.expense.type === 'expense' ? -Math.abs(this.expense.amount) : Math.abs(this.expense.amount)
      };
      
      await this.firebaseService.addTransaction(dataToSave);
      const typeLabel = this.expense.type.charAt(0).toUpperCase() + this.expense.type.slice(1);
      alert(`${typeLabel} added successfully!`);
      
      // Reset form
      this.expense = {
        amount: 0,
        description: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        type: 'expense'
      };
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Error adding item');
    }
  }

  logout() {
    this.firebaseService.logout();
    this.router.navigate(['/auth']);
  }

  viewTransactions() {
    this.router.navigate(['/transactions']);
  }
}
