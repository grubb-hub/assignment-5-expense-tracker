import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { AuthComponent } from './auth/auth';
import { FirebaseService } from './firebase.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AuthComponent],
  templateUrl: './app.html'
})
export class AppComponent implements OnInit {
  title = 'Expense Tracker';

  constructor(
    private firebaseService: FirebaseService,
    private router: Router
  ) {
    this.testUser();
  }

  ngOnInit() {
    // Listen for auth state changes and navigate accordingly
    this.firebaseService.auth.onAuthStateChanged((user) => {
      if (user) {
        this.router.navigate(['/transaction']);
      } else {
        this.router.navigate(['/auth']);
      }
    });
  }

  testUser() {
    console.log("👤 Current user:", this.firebaseService.currentUser);
  }
}