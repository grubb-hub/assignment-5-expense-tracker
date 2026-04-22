import { Component, signal, OnInit, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FirebaseService } from '../firebase.service';
import { Router } from '@angular/router';

type UserProfile = {
  name: string;
  email: string;
  budgets: {
    food: number;
    transport: number;
    entertainment: number;
    utilities: number;
    other: number;
  };
};

type BudgetStatus = {
  [key: string]: {
    spent: number;
    budget: number;
    percentage: number;
    status: 'safe' | 'warning' | 'exceeded';
  };
};

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class ProfileComponent implements OnInit {

  loading = signal(true);
  transactions = signal<any[]>([]);

  profile = signal<UserProfile>({
    name: '',
    email: '',
    budgets: {
      food: 0,
      transport: 0,
      entertainment: 0,
      utilities: 0,
      other: 0
    }
  });

  // Computed budget status based on current spending
  budgetStatus = computed(() => {
    const status: BudgetStatus = {};
    const profile = this.profile();
    const trans = this.transactions();

    const categories = ['food', 'transport', 'entertainment', 'utilities', 'other'] as const;

    categories.forEach(cat => {
      const spent = trans
        .filter(t => t.category?.toLowerCase() === cat)
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      const budget = profile.budgets[cat];
      const percentage = budget > 0 ? (spent / budget) * 100 : 0;

      let statusType: 'safe' | 'warning' | 'exceeded' = 'safe';
      if (percentage >= 100) {
        statusType = 'exceeded';
      } else if (percentage >= 80) {
        statusType = 'warning';
      }

      status[cat] = {
        spent: Math.round(spent * 100) / 100,
        budget,
        percentage: Math.round(percentage),
        status: statusType
      };
    });

    return status;
  });

  constructor(
    private firebaseService: FirebaseService,
    private router: Router
  ) {}

async ngOnInit() {
  const user = this.firebaseService.getCurrentUser();

  if (!user) {
    this.loading.set(false);
    return;
  }

  const data: any = await this.firebaseService.getUserProfile();

  this.profile.set({
    name: data?.name ?? '',
    email: data?.email ?? user.email ?? '',
    budgets: {
      food: data?.budgets?.food ?? 0,
      transport: data?.budgets?.transport ?? 0,
      entertainment: data?.budgets?.entertainment ?? 0,
      utilities: data?.budgets?.utilities ?? 0,
      other: data?.budgets?.other ?? 0
    }
  });

  // Load transactions in real-time
  this.firebaseService.getTransactions((trans: any[]) => {
    this.transactions.set(trans);
    
    // Show alerts for budget status
    const status = this.budgetStatus();
    Object.entries(status).forEach(([category, info]) => {
      if (info.status === 'exceeded') {
        console.warn(`⚠️ ${category.toUpperCase()} budget exceeded! Spent: $${info.spent} / Budget: $${info.budget}`);
      } else if (info.status === 'warning') {
        console.warn(`⚠️ ${category.toUpperCase()} budget at ${info.percentage}% - You've spent $${info.spent} / Budget: $${info.budget}`);
      }
    });
  });

  this.loading.set(false);
}

  updateBudget(category: keyof UserProfile['budgets'], value: string) {
    const numValue = value === '' ? 0 : parseFloat(value);
    this.profile.update(p => ({
      ...p,
      budgets: { ...p.budgets, [category]: isNaN(numValue) ? 0 : numValue }
    }));
  }

  updateName(value: string) {
    this.profile.update(p => ({ ...p, name: value }));
  }

  async saveProfile() {
    try {
      const profileData = this.profile();
      console.log('💾 Saving profile:', profileData);
      await this.firebaseService.saveUserProfile(profileData);
      alert('Profile saved!');
    } catch (err) {
      console.error(err);
      alert('Error saving profile');
    }
  }

  logout() {
    this.firebaseService.logout();
    this.router.navigate(['/auth']);
  }
}