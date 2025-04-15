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
      <button 
        class="zoom-btn" 
        (click)="showFullImage()"
        [attr.aria-label]="'View full size logo for ' + logo.name"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
          <path fill="currentColor" d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
        </svg>
      </button>
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

    .zoom-btn {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.9);
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #333;
      padding: 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      transition: background-color 0.2s ease;
      z-index: 2;
    }

    .logo-image-container:hover .zoom-btn {
      opacity: 1;
    }

    .zoom-btn:hover {
      background: white;
      color: #007bff;
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

    .download-btn {
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
      background-color: #007bff;
      color: white;
    }

    .download-btn:hover {
      background-color: #0056b3;
      transform: translateY(-1px);
    }

    .download-btn:focus {
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

      .download-btn {
        padding: 0.4rem;
        font-size: 0.7rem;
      }
    }
  `]
})
export class LogoItemComponent {
  @Input() logo!: TeamLogo;
  imageLoaded = false;

  constructor(private modalService: ModalService) {}

  onImageLoad() {
    this.imageLoaded = true;
  }

  handleImageError(event: Event) {
    (event.target as HTMLImageElement).style.display = 'none';
  }

  showFullImage() {
    this.modalService.openModal({
      teamInfo: {
        id: this.logo.id,
        name: this.logo.name,
        fullName: this.logo.name,
        path: this.logo.path,
        founded: 0,
        colors: {
          primary: '#000000',
          secondary: '#FFFFFF'
        },
        stadium: { name: '', capacity: 0, location: '' },
        history: '',
        achievements: { leagueTitles: 0, cupTitles: 0 }
      },
      logoPath: this.logo.path
    });
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