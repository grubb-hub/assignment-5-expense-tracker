import { Component, signal, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirebaseService } from '../firebase.service';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

import { BaseChartDirective } from 'ng2-charts';
import { Chart, registerables, ChartOptions } from 'chart.js';
import { CATEGORIES } from '../constants/categories';

Chart.register(...registerables);

interface Transaction {
  id: string;
  amount: number;
  category: string;
  date: string;
  type: 'expense' | 'income';
  description: string;
}

interface MonthlyData {
  month: string;
  income: number;
  expense: number;
}

interface CategorySummary {
  [key: string]: number;
}

interface BudgetComparison {
  [key: string]: {
    budget: number;
    actual: number;
    percentage: number;
  };
}

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, BaseChartDirective],
  templateUrl: './analytics.html',
  styleUrl: './analytics.css'
})
export class AnalyticsComponent implements OnInit {
  private firebaseService = inject(FirebaseService);
  private router = inject(Router);

  transactions = signal<Transaction[]>([]);
  loading = signal(true);
  userProfile = signal<any>(null);

  Math = Math;
  Object = Object;

  // ✅ PIE CHART CONFIG
  pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };

  pieChartType: 'pie' = 'pie';

  // ---------------- CURRENT MONTH ----------------
  currentMonth = computed(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // ---------------- SUMMARY ----------------
  monthlySummary = computed(() => {
    const month = this.currentMonth();
    const trans = this.transactions();

    const income = trans
      .filter(t => t.type === 'income' && t.date.startsWith(month))
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const expense = trans
      .filter(t => t.type === 'expense' && t.date.startsWith(month))
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    return {
      income: Math.round(income * 100) / 100,
      expense: Math.round(expense * 100) / 100,
      balance: Math.round((income - expense) * 100) / 100
    };
  });

  // ---------------- CATEGORY SPENDING (FIXED) ----------------
  categorySpending = computed(() => {
    const month = this.currentMonth();
    const trans = this.transactions();
    const categories: CategorySummary = {};

    trans
      .filter(t => t.type === 'expense' && t.date.startsWith(month))
      .forEach(t => {

        // ✅ FIX: normalize category properly using your constants
        const cat =
          CATEGORIES.find(c =>
            c.value === (t.category || '').toLowerCase().trim()
          )?.value || 'other';

        categories[cat] = (categories[cat] || 0) + (t.amount || 0);
      });

    const result = Object.entries(categories)
      .map(([name, value]) => ({
        name,
        value: Math.round(value * 100) / 100
      }))
      .sort((a, b) => b.value - a.value);

    console.log('📈 Category spending:', result);
    return result;
  });

  // ---------------- BUDGET ----------------
  budgetComparison = computed(() => {
    const month = this.currentMonth();
    const trans = this.transactions();
    const profile = this.userProfile();
    const comparison: BudgetComparison = {};

    const budgets = profile?.budgets || {
      food: 0,
      transport: 0,
      entertainment: 0,
      utilities: 0,
      other: 0
    };

    Object.entries(budgets).forEach(([category, budget]) => {
      const actual = trans
        .filter(
          t =>
            t.type === 'expense' &&
            t.date.startsWith(month) &&
            t.category?.toLowerCase() === category
        )
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      const budgetNum = budget as number;
      const percentage = budgetNum > 0 ? Math.round((actual / budgetNum) * 100) : 0;

      comparison[category] = {
        budget: budgetNum,
        actual: Math.round(actual * 100) / 100,
        percentage
      };
    });

    return comparison;
  });

  // ---------------- PIE DATA ----------------
  chartData = computed(() => {
    const spending = this.categorySpending();

    return {
      labels: spending.map(s => s.name),
      datasets: [
        {
          label: 'Spending by Category',
          data: spending.map(s => s.value),
          backgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0',
            '#9966FF'
          ],
          borderColor: '#fff',
          borderWidth: 2
        }
      ]
    };
  });

  // ---------------- INIT ----------------
  ngOnInit() {
    const user = this.firebaseService.getCurrentUser();
    if (!user) {
      this.router.navigate(['/auth']);
      return;
    }

    this.firebaseService.getUserProfile().then(profile => {
      this.userProfile.set(profile);
    });

    this.firebaseService.getTransactions((trans: any[]) => {
      const today = new Date().toISOString().split('T')[0];

      const mappedTransactions = trans.map(t => {
        let dateStr = t.date || today;
        if (!dateStr.match(/\d{4}-\d{2}-\d{2}/)) {
          dateStr = today;
        }

        return {
          id: t.id,
          amount: Number(t.amount) || 0,
          category: (t.category || 'other').toLowerCase().trim(),
          date: dateStr,
          type: (t.type || 'expense').toLowerCase().trim() as 'expense' | 'income',
          description: t.description || '',
          userId: t.userId
        };
      });

      this.transactions.set(mappedTransactions);
      this.loading.set(false);

      setTimeout(() => this.checkBudgetAlerts(), 500);
    });
  }

  checkBudgetAlerts() {
    const status = this.budgetComparison();

    Object.entries(status).forEach(([category, info]) => {
      if (info.percentage >= 100) {
        console.warn(`🔴 ${category} budget EXCEEDED`);
      } else if (info.percentage >= 80) {
        console.warn(`🟡 ${category} at ${info.percentage}%`);
      }
    });
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  getStatusClass(percentage: number): string {
    if (percentage >= 100) return 'exceeded';
    if (percentage >= 80) return 'warning';
    return 'safe';
  }
}