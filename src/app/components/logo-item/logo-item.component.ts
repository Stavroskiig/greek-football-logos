import { Component, Input } from '@angular/core';
import { TeamLogo } from '../../models/team-logo';
import { CommonModule } from '@angular/common';
import { TeamInfoService } from '../../services/team-info.service';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-logo-item',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="logo-item">
      <div class="logo-image-container">
        <div class="image-placeholder" *ngIf="!imageLoaded">
          <div class="loading-spinner"></div>
        </div>
        <img 
          [src]="logo.path" 
          [alt]="logo.name + ' logo'"
          (load)="onImageLoad()"
          (error)="handleImageError($event)"
          [class.loaded]="imageLoaded"
        >
      </div>
      <h3 class="team-name" [title]="logo.name">{{ logo.name }}</h3>
      <p class="league-name" *ngIf="logo.league" [title]="logo.league">{{ logo.league }}</p>
      <div class="logo-actions">
        <button 
          class="details-btn" 
          (click)="showDetails()"
          [disabled]="isLoadingDetails"
          [attr.aria-label]="'View details for ' + logo.name"
        >
          <span *ngIf="!isLoadingDetails">Details</span>
          <div class="loading-spinner" *ngIf="isLoadingDetails"></div>
        </button>
        <button 
          class="download-btn" 
          (click)="downloadLogo()"
          [attr.aria-label]="'Download logo for ' + logo.name"
        >
          Download
        </button>
      </div>
    </div>
  `,
  styles: [`
    .logo-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 1rem;
      border-radius: 8px;
      background: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
      width: 180px;
      min-height: 160px;
      box-sizing: border-box;
      margin: 0 auto;
      position: relative;
    }

    .logo-item:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0,0,0,0.15);
    }

    .logo-image-container {
      width: 80px;
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 0.75rem;
      flex-shrink: 0;
      position: relative;
    }

    .image-placeholder {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f5f5f5;
      border-radius: 4px;
    }

    .loading-spinner {
      width: 20px;
      height: 20px;
      border: 2px solid #f3f3f3;
      border-top: 2px solid #3498db;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      display: block;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    img.loaded {
      opacity: 1;
    }

    .team-name {
      margin: 0;
      font-size: 0.9rem;
      text-align: center;
      font-weight: 600;
      color: #333;
      line-height: 1.2;
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      cursor: help;
      position: relative;
      transition: all 0.3s ease;
    }

    .team-name:hover {
      overflow: visible;
      white-space: normal;
      z-index: 1;
      background: white;
      padding: 0.25rem;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      transform: translateY(-2px);
    }

    .league-name {
      margin: 0.25rem 0 0;
      font-size: 0.75rem;
      color: #666;
      text-align: center;
      line-height: 1.2;
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      cursor: help;
      position: relative;
      transition: all 0.3s ease;
    }

    .league-name:hover {
      overflow: visible;
      white-space: normal;
      z-index: 1;
      background: white;
      padding: 0.25rem;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      transform: translateY(-2px);
    }

    .logo-actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.75rem;
      width: 100%;
    }

    .details-btn, .download-btn {
      flex: 1;
      padding: 0.5rem;
      border: none;
      border-radius: 4px;
      font-size: 0.75rem;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 32px;
    }

    .details-btn {
      background-color: #f0f0f0;
      color: #333;
    }

    .details-btn:hover:not(:disabled) {
      background-color: #e0e0e0;
      transform: translateY(-1px);
    }

    .details-btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .download-btn {
      background-color: #007bff;
      color: white;
    }

    .download-btn:hover {
      background-color: #0056b3;
      transform: translateY(-1px);
    }

    .details-btn:focus, .download-btn:focus {
      outline: 2px solid #007bff;
      outline-offset: 2px;
    }

    @media (max-width: 768px) {
      .logo-item {
        width: 160px;
      }

      .logo-image-container {
        width: 70px;
        height: 70px;
      }

      .team-name, .league-name {
        font-size: 0.8rem;
      }

      .details-btn, .download-btn {
        padding: 0.4rem;
        font-size: 0.7rem;
      }
    }
  `]
})
export class LogoItemComponent {
  @Input() logo!: TeamLogo;
  imageLoaded = false;
  isLoadingDetails = false;

  constructor(
    private teamInfoService: TeamInfoService,
    private modalService: ModalService
  ) {}

  onImageLoad() {
    this.imageLoaded = true;
  }

  handleImageError(event: Event) {
    (event.target as HTMLImageElement).style.display = 'none';
  }

  showDetails() {
    this.isLoadingDetails = true;
    this.teamInfoService.getTeamInfo(this.logo.id).subscribe(
      info => {
        this.modalService.openModal({
          teamInfo: info,
          logoPath: this.logo.path
        });
        this.isLoadingDetails = false;
      },
      error => {
        console.error('Error loading team details:', error);
        this.isLoadingDetails = false;
      }
    );
  }

  downloadLogo() {
    const link = document.createElement('a');
    link.href = this.logo.path;
    link.download = `${this.logo.name.toLowerCase().replace(/\s+/g, '-')}-logo.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}