import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatGridListModule,
    MatIconModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent {
  pages = [
    {
      title: 'Analytics',
      description: 'View spending analytics & budgets',
      link: '/analytics',
      icon: 'bar_chart'
    },
    {
      title: 'My Transactions',
      description: 'View all transactions',
      link: '/transactions',
      icon: 'list'
    },
    {
      title: 'Add Transaction',
      description: 'Create a new transaction',
      link: '/transaction',
      icon: 'add_circle'
    },
    {
      title: 'Manage Transaction',
      description: 'Edit or delete existing transactions',
      link: '/transaction',
      icon: 'edit'
    },
    {
      title: 'Profile',
      description: 'Manage your profile',
      link: '/profile',
      icon: 'person'
    },
    {
      title: 'Logout',
      description: 'Sign out from your account',
      link: '/auth',
      icon: 'logout'
    }
  ];
}
