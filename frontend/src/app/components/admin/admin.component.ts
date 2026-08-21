import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { LogoService } from '../../services/logo.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent {
  isSyncing: boolean = false;
  showToast: boolean = false;
  toastMessage: string = '';

  constructor(
    private adminService: AdminService,
    private logoService: LogoService,
    private router: Router
  ) { }

  logout(): void {
    this.adminService.logout();
    this.router.navigate(['/']);
  }

  async syncLogos(): Promise<void> {
    if (this.isSyncing) return;
    
    this.isSyncing = true;
    this.showToast = true;
    this.toastMessage = 'Syncing logos from manifest...';
    
    try {
      const manifestResponse = await fetch('/assets/logos-manifest.json');
      if (!manifestResponse.ok) {
        throw new Error('Could not fetch local logos-manifest.json');
      }
      const manifestData = await manifestResponse.json();

      const response = await import('rxjs').then(rxjs => rxjs.firstValueFrom(this.logoService.syncLogos(manifestData)));
      this.toastMessage = `Sync complete! ${response.addedCount} new logos added.`;
    } catch (err) {
      console.error('Logo sync failed:', err);
      this.toastMessage = 'Logo sync failed. Check console.';
    } finally {
      this.isSyncing = false;
      setTimeout(() => {
        this.showToast = false;
      }, 5000);
    }
  }
} 