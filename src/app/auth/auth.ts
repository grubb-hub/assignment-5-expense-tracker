import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FirebaseService } from '../firebase.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './auth.html',
  styleUrls: ['./auth.css']
})
export class AuthComponent {

  email = '';
  password = '';

  constructor(
    private firebaseService: FirebaseService,
    private router: Router
  ) {}

  async register() {
    try {
      const user = await this.firebaseService.register(this.email, this.password);
      console.log("✅ Registered:", user.user.email);
      alert("Registered successfully");
      this.router.navigate(['/transaction']);
    } catch (err: any) {
      console.error("❌ Register error:", err.message);
      alert(err.message);
    }
  }

  async login() {
    try {
      const user = await this.firebaseService.login(this.email, this.password);
      console.log("✅ Logged in:", user.user.email);
      alert("Login successful");
      this.router.navigate(['/transaction']);
    } catch (err: any) {
      console.error("❌ Login error:", err.message);
      alert(err.message);
    }
  }
}