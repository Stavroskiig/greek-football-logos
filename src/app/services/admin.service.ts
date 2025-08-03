import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private isAdminSubject = new BehaviorSubject<boolean>(false);
  private readonly ADMIN_KEY = 'greek_football_admin';

  constructor() {
    this.checkAdminStatus();
  }

  private checkAdminStatus(): void {
    const adminStatus = localStorage.getItem(this.ADMIN_KEY);
    this.isAdminSubject.next(adminStatus === 'true');
  }

  isAdmin(): boolean {
    return this.isAdminSubject.value;
  }

  isAdmin$() {
    return this.isAdminSubject.asObservable();
  }

  login(password: string): boolean {
    // Simple password check - you can change this to any password you want
    const correctPassword = 'admin123'; // Change this to your preferred password
    if (password === correctPassword) {
      localStorage.setItem(this.ADMIN_KEY, 'true');
      this.isAdminSubject.next(true);
      return true;
    }
    return false;
  }

  logout(): void {
    localStorage.removeItem(this.ADMIN_KEY);
    this.isAdminSubject.next(false);
  }
} 