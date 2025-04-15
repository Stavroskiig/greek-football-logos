import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-logo-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './logo-filters.component.html',
  styleUrls: ['./logo-filters.component.css']
})
export class LogoFiltersComponent {
  @Input() leagues: string[] = [];
  @Input() selectedLeague: string = '';
  @Input() searchTerm: string = '';

  @Output() searchChange = new EventEmitter<string>();
  @Output() leagueChange = new EventEmitter<string>();

  onSearchChange() {
    this.searchChange.emit(this.searchTerm);
  }

  onLeagueChange() {
    this.leagueChange.emit(this.selectedLeague);
  }

  clearSearch() {
    this.searchTerm = '';
    this.searchChange.emit('');
  }

  getLeagueDisplayName(league: string): string {
    if (!league) return '🌍 All Leagues';
    return league === 'SUPERLEAGUE' ? '🏆 Superleague' : league;
  }
} 