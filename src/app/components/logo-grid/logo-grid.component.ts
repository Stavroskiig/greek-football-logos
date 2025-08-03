import { Component, Input } from '@angular/core';
import { TeamLogo } from '../../models/team-logo';
import { CommonModule } from '@angular/common';
import { LogoItemComponent } from '../logo-item/logo-item.component';

@Component({
  selector: 'app-logo-grid',
  standalone: true,
  imports: [CommonModule, LogoItemComponent],
  templateUrl: './logo-grid.component.html'
})
export class LogoGridComponent {
  @Input() logos: TeamLogo[] = [];
} 