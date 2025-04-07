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
        <img 
          [src]="logo.path" 
          [alt]="logo.name + ' logo'"
          (error)="handleImageError($event)"
        >
      </div>
      <h3>{{ logo.name }}</h3>
      <p *ngIf="logo.league">{{ logo.league }}</p>
      <div class="logo-actions">
        <button class="details-btn" (click)="showDetails()">Details</button>
        <button class="download-btn" (click)="downloadLogo()">Download</button>
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
      transition: transform 0.2s ease;
      width: 180px;
      min-height: 160px;
      box-sizing: border-box;
      margin: 0 auto;
    }

    .logo-item:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }

    .logo-image-container {
      width: 80px;
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 0.75rem;
      flex-shrink: 0;
    }

    img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      display: block;
    }

    h3 {
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
    }

    p {
      margin: 0.25rem 0 0;
      font-size: 0.75rem;
      color: #666;
      text-align: center;
      line-height: 1.2;
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .logo-actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.75rem;
    }

    .details-btn, .download-btn {
      padding: 0.25rem 0.5rem;
      border: none;
      border-radius: 4px;
      font-size: 0.75rem;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    .details-btn {
      background-color: #f0f0f0;
      color: #333;
    }

    .details-btn:hover {
      background-color: #e0e0e0;
    }

    .download-btn {
      background-color: #007bff;
      color: white;
    }

    .download-btn:hover {
      background-color: #0056b3;
    }
  `]
})
export class LogoItemComponent {
  @Input() logo!: TeamLogo;

  constructor(
    private teamInfoService: TeamInfoService,
    private modalService: ModalService
  ) {}

  handleImageError(event: Event) {
    (event.target as HTMLImageElement).style.display = 'none';
  }

  showDetails() {
    this.teamInfoService.getTeamInfo(this.logo.id).subscribe(
      info => {
        this.modalService.openModal({
          teamInfo: info,
          logoPath: this.logo.path
        });
      },
      error => {
        console.error('Error loading team details:', error);
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