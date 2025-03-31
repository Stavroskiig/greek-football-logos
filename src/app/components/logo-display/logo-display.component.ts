import { Component } from '@angular/core';
import { LogoService } from '../../services/logo.service';
import { Observable } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TeamLogo } from '../../models/team-logo'; // Add this import
import { map } from 'rxjs/operators'; // Add this import

@Component({
  selector: 'app-logo-display',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './logo-display.component.html',
  styleUrls: ['./logo-display.component.css']
})
export class LogoDisplayComponent {
  logos$: Observable<TeamLogo[]>;
  leagues$: Observable<string[]>;
  selectedLeague: string = 'SUPERLEAGUE'; // Empty means default (superleague)
  searchTerm: string = '';

  constructor(private logoService: LogoService) {
    // Initial load with Superleague
    this.logos$ = this.logoService.getLogos(this.selectedLeague);
    this.leagues$ = this.logoService.getLeagues();
  }

  applyFilters(): void {
    this.logos$ = this.logoService.getLogos(
      this.selectedLeague === 'All Leagues' ? '' : this.selectedLeague, // Empty string for all leagues
      this.searchTerm
    );
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilters(); // Reapply filters with an empty search term
  }

  getGroupedLeagues(logos: TeamLogo[]): {name: string, logos: TeamLogo[]}[] {
    const leagues = [...new Set(logos.map(logo => logo.league))];
    return leagues.map(league => ({
      name: league,
      logos: logos.filter(logo => logo.league === league)
    }));
  }

  handleImageError(event: Event) {
    (event.target as HTMLImageElement).style.display = 'none';
  }

  getLeagueDisplayName(league: string): string {
    if (!league) return '🌍 All Leagues';
    return league === 'SUPERLEAGUE' ? '🏆 Superleague' : league;
  }
}