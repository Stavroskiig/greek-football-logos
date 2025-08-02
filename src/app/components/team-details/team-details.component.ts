import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-team-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './team-details.component.html'
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