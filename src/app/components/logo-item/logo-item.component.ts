import { Component, Input } from '@angular/core';
import { TeamLogo } from '../../models/team-logo';
import { CommonModule } from '@angular/common';
import { TeamInfoService } from '../../services/team-info.service';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-logo-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './logo-item.component.html',
  styleUrls: ['./logo-item.component.css']
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