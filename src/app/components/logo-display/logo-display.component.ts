import { Component } from '@angular/core';
import { LogoService } from '../../services/logo.service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { TeamLogo } from '../../models/team-logo';
import { LogoFiltersComponent } from '../logo-filters/logo-filters.component';
import { LogoGridComponent } from '../logo-grid/logo-grid.component';

@Component({
  selector: 'app-logo-display',
  standalone: true,
  imports: [CommonModule, LogoFiltersComponent, LogoGridComponent],
  template: `
    <div class="container">
      <h1>Greek Football Team Logos</h1>
      
      <app-logo-filters
        [leagues]="(leagues$ | async) || []"
        [selectedLeague]="selectedLeague"
        [searchTerm]="searchTerm"
        (searchChange)="onSearchChange($event)"
        (leagueChange)="onLeagueChange($event)"
      ></app-logo-filters>

      <app-logo-grid
        [logos]="(logos$ | async) || []"
      ></app-logo-grid>
    </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 0;
    }

    h1 {
      text-align: center;
      margin-bottom: 2rem;
      color: #333;
      padding: 0 1rem;
    }
  `]
})
export class LogoDisplayComponent {
  logos$: Observable<TeamLogo[]>;
  leagues$: Observable<string[]>;
  selectedLeague: string = 'SUPERLEAGUE';
  searchTerm: string = '';

  constructor(private logoService: LogoService) {
    this.logos$ = this.logoService.getLogos(this.selectedLeague);
    this.leagues$ = this.logoService.getLeagues();
  }

  onSearchChange(searchTerm: string) {
    this.searchTerm = searchTerm;
    this.applyFilters();
  }

  onLeagueChange(league: string) {
    this.selectedLeague = league;
    this.applyFilters();
  }

  private applyFilters(): void {
    this.logos$ = this.logoService.getLogos(
      this.selectedLeague === 'All Leagues' ? '' : this.selectedLeague,
      this.searchTerm
    );
  }

  getGroupedLeagues(logos: TeamLogo[]): {name: string, logos: TeamLogo[]}[] {
    const leagues = [...new Set(logos.map(logo => logo.league || 'Uncategorized'))];
    return leagues.map(league => ({
      name: league,
      logos: logos.filter(logo => (logo.league || 'Uncategorized') === league)
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