import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-login.component.html'
})
export class AdminLoginComponent {
  password: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private adminService: AdminService,
    private router: Router
  ) {}

  login() {
    this.isLoading = true;
    this.errorMessage = '';

    // Simulate a small delay for better UX
    setTimeout(() => {
      if (this.adminService.login(this.password)) {
        this.router.navigate(['/manage-tags']);
      } else {
        this.errorMessage = 'Invalid password. Please try again.';
      }
      this.isLoading = false;
    }, 500);
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.login();
    }
  }
} 