import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogoDisplayComponent } from './components/logo-display/logo-display.component';
import { TeamDetailsComponent } from './components/team-details/team-details.component';
import { ModalService } from './services/modal.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, LogoDisplayComponent, TeamDetailsComponent],
  template: `
    <app-logo-display></app-logo-display>
    <app-team-details *ngIf="modalService.modalData$ | async"></app-team-details>
  `,
  styles: []
})
export class AppComponent {
  constructor(public modalService: ModalService) {}
}