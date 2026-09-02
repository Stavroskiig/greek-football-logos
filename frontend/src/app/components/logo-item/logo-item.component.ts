import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Team } from '../../models/team';
import { ModalService } from '../../services/modal.service';
import { TranslatePipe } from '@ngx-translate/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-logo-item',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './logo-item.component.html'
})
export class LogoItemComponent {
  @Input() logo!: Team;
  imageLoaded = false;

  constructor(private modalService: ModalService, private router: Router) { }

  showTeamHistory() {
    this.router.navigate(['/team', this.logo.id, 'history']);
  }

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
        path: this.logo.path || '',
        founded: this.logo.founded || 0,
        colors: {
          primary: this.logo.colors?.primary || '#000000',
          secondary: this.logo.colors?.secondary || '#FFFFFF'
        },
        stadium: { 
          name: this.logo.stadium?.name || '', 
          capacity: this.logo.stadium?.capacity || 0, 
          location: this.logo.stadium?.location || ''
        },
        history: this.logo.historyEn || '', // or historyEl
        achievements: this.logo.achievements ? { leagueTitles: this.logo.achievements.championships || 0, cupTitles: this.logo.achievements.cups || 0 } : { leagueTitles: 0, cupTitles: 0 },
        historicalLogos: this.logo.historicalLogos || []
      },
      logoPath: this.logo.path || ''
    });
  }

  downloadLogo() {
    const link = document.createElement('a');
    link.href = this.logo.path || '';
    link.download = `${this.logo.name.toLowerCase().replace(/\s+/g, '-')}-logo.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
