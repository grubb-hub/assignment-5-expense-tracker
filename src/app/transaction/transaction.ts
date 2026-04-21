import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FirebaseService } from '../firebase.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-transaction',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './transaction.html',
  styleUrl: './transaction.css',
})
export class TransactionComponent {
  transaction = {
    amount: 0,
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0] // Default to today
  };

  constructor(
    private firebaseService: FirebaseService,
    private router: Router
  ) {}

  async addTransaction() {
    try {
      await this.firebaseService.addTransaction(this.transaction);
      alert('Transaction added successfully!');
      // Reset form
      this.transaction = {
        amount: 0,
        description: '',
        category: '',
        date: new Date().toISOString().split('T')[0]
      };
    } catch (error) {
      console.error('Error adding transaction:', error);
      alert('Error adding transaction');
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
