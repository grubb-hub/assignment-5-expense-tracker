import { Component, signal, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class ProfileComponent implements OnInit {

  loading = signal(true);

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