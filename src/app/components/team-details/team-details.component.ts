import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-team-details',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-backdrop" (click)="closeModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <button class="close-button" (click)="closeModal()">✕</button>
        
        <ng-container *ngIf="modalService.modalData$ | async as data">
          <div class="team-header">
            <img [src]="data.logoPath" [alt]="data.teamInfo.name + ' logo'" class="team-logo">
            <div class="team-title">
              <h2>{{ data.teamInfo.fullName }}</h2>
              <p class="founded">Founded in {{ data.teamInfo.founded }}</p>
            </div>
          </div>

          <div class="team-details">
            <section class="stadium-section">
              <h3>Stadium</h3>
              <div class="stadium-info">
                <img *ngIf="data.teamInfo.stadium.image" 
                     [src]="data.teamInfo.stadium.image" 
                     [alt]="data.teamInfo.stadium.name"
                     class="stadium-image">
                <div class="stadium-details">
                  <p><strong>{{ data.teamInfo.stadium.name }}</strong></p>
                  <p>Capacity: {{ data.teamInfo.stadium.capacity.toLocaleString() }}</p>
                  <p>Location: {{ data.teamInfo.stadium.location }}</p>
                </div>
              </div>
            </section>

            <section class="history-section">
              <h3>History</h3>
              <p>{{ data.teamInfo.history }}</p>
            </section>

            <section class="achievements-section">
              <h3>Achievements</h3>
              <div class="achievements-grid">
                <div class="achievement">
                  <span class="number">{{ data.teamInfo.achievements.leagueTitles }}</span>
                  <span class="label">League Titles</span>
                </div>
                <div class="achievement">
                  <span class="number">{{ data.teamInfo.achievements.cupTitles }}</span>
                  <span class="label">Cup Titles</span>
                </div>
                <ng-container *ngIf="data.teamInfo.achievements.otherTitles">
                  <div class="achievement" *ngFor="let title of getOtherTitles(data.teamInfo)">
                    <span class="number">{{ title.count }}</span>
                    <span class="label">{{ formatTitleName(title.name) }}</span>
                  </div>
                </ng-container>
              </div>
            </section>

            <section class="links-section" *ngIf="data.teamInfo.website || data.teamInfo.socialMedia">
              <h3>Official Links</h3>
              <div class="links-grid">
                <a *ngIf="data.teamInfo.website" 
                   [href]="data.teamInfo.website" 
                   target="_blank" 
                   class="website-link">
                  Official Website
                </a>
                <div class="social-links" *ngIf="data.teamInfo.socialMedia">
                  <a *ngIf="data.teamInfo.socialMedia.facebook" 
                     [href]="data.teamInfo.socialMedia.facebook" 
                     target="_blank">
                    Facebook
                  </a>
                  <a *ngIf="data.teamInfo.socialMedia.twitter" 
                     [href]="data.teamInfo.socialMedia.twitter" 
                     target="_blank">
                    Twitter
                  </a>
                  <a *ngIf="data.teamInfo.socialMedia.instagram" 
                     [href]="data.teamInfo.socialMedia.instagram" 
                     target="_blank">
                    Instagram
                  </a>
                </div>
              </div>
            </section>
          </div>
        </ng-container>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 8px;
      width: 90%;
      max-width: 800px;
      max-height: 90vh;
      overflow-y: auto;
      position: relative;
      padding: 2rem;
    }

    .close-button {
      position: absolute;
      top: 1rem;
      right: 1rem;
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #666;
    }

    .team-header {
      display: flex;
      align-items: center;
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .team-logo {
      width: 100px;
      height: 100px;
      object-fit: contain;
    }

    .team-title h2 {
      margin: 0;
      font-size: 1.8rem;
      color: #333;
    }

    .founded {
      margin: 0.5rem 0 0;
      color: #666;
    }

    section {
      margin-bottom: 2rem;
    }

    h3 {
      color: #333;
      margin-bottom: 1rem;
      font-size: 1.4rem;
    }

    .stadium-info {
      display: flex;
      gap: 1.5rem;
      align-items: flex-start;
    }

    .stadium-image {
      width: 200px;
      height: 150px;
      object-fit: cover;
      border-radius: 4px;
    }

    .stadium-details {
      flex: 1;
    }

    .achievements-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
    }

    .achievement {
      text-align: center;
      padding: 1rem;
      background: #f5f5f5;
      border-radius: 4px;
    }

    .achievement .number {
      display: block;
      font-size: 2rem;
      font-weight: bold;
      color: #333;
    }

    .achievement .label {
      display: block;
      margin-top: 0.5rem;
      color: #666;
    }

    .links-grid {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .website-link,
    .social-links a {
      display: inline-block;
      padding: 0.5rem 1rem;
      background: #f5f5f5;
      border-radius: 4px;
      color: #333;
      text-decoration: none;
      transition: background-color 0.2s;
    }

    .website-link:hover,
    .social-links a:hover {
      background: #e0e0e0;
    }

    .social-links {
      display: flex;
      gap: 1rem;
    }

    @media (max-width: 600px) {
      .modal-content {
        padding: 1rem;
      }

      .team-header {
        flex-direction: column;
        text-align: center;
      }

      .stadium-info {
        flex-direction: column;
      }

      .stadium-image {
        width: 100%;
        height: auto;
      }

      .social-links {
        flex-direction: column;
      }
    }
  `]
})
export class TeamDetailsComponent {
  constructor(public modalService: ModalService) {}

  closeModal() {
    this.modalService.closeModal();
  }

  getOtherTitles(teamInfo: any) {
    if (!teamInfo.achievements.otherTitles) return [];
    return Object.entries(teamInfo.achievements.otherTitles).map(([name, count]) => ({
      name,
      count
    }));
  }

  formatTitleName(name: string): string {
    return name
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
      .trim();
  }
} 