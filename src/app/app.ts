import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FirebaseService } from './firebase.service';
import { NavbarComponent } from './navbar/navbar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, NavbarComponent],
  templateUrl: './app.html'
})
export class AppComponent implements OnInit {
  title = 'Expense Tracker';
  isAuthenticated = false;

  constructor(
    private firebaseService: FirebaseService,
    private router: Router
  ) {
    this.testUser();
  }

  ngOnInit() {
    // Listen for auth state changes and navigate accordingly
    this.firebaseService.auth.onAuthStateChanged((user) => {
      this.isAuthenticated = !!user;
      if (user) {
        this.router.navigate(['/dashboard']);
      } else {
        this.router.navigate(['/auth']);
      }
    });
  }

  testUser() {
    console.log("👤 Current user:", this.firebaseService.currentUser);
  }
}