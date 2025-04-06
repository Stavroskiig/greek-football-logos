import { Component, Input } from '@angular/core';
import { TeamLogo } from '../../models/team-logo';
import { CommonModule } from '@angular/common';
import { LogoItemComponent } from '../logo-item/logo-item.component';

@Component({
  selector: 'app-logo-grid',
  standalone: true,
  imports: [CommonModule, LogoItemComponent],
  template: `
    <div class="logo-grid">
      <app-logo-item 
        *ngFor="let logo of logos" 
        [logo]="logo"
      ></app-logo-item>
    </div>
    
    <div *ngIf="logos.length === 0" class="no-results">
      No teams found matching your criteria.
    </div>
  `,
  styles: [`
    .logo-grid {
      display: grid;
      grid-template-columns: repeat(5, 180px);
      justify-content: space-between;
      gap: 1rem;
      max-width: 1000px;
      margin: 3rem auto;
      padding: 0;
    }

    .no-results {
      text-align: center;
      padding: 3rem;
      color: #666;
      font-size: 1.2rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin: 0 1rem;
    }

    @media (max-width: 1024px) {
      .logo-grid {
        grid-template-columns: repeat(4, 180px);
        max-width: 800px;
      }
    }

    @media (max-width: 840px) {
      .logo-grid {
        grid-template-columns: repeat(3, 180px);
        max-width: 600px;
      }
    }

    @media (max-width: 768px) {
      .logo-grid {
        grid-template-columns: repeat(auto-fit, 150px);
        gap: 1rem;
        justify-content: center;
        padding: 0 1rem;
      }
    }
  `]
})
export class LogoGridComponent {
  @Input() logos: TeamLogo[] = [];
} 