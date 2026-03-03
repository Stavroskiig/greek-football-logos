import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LogoService } from '../../services/logo.service';
import { StructuredDataService } from '../../services/structured-data.service';
import { Observable, combineLatest, map } from 'rxjs';
import { LogoItemComponent } from '../logo-item/logo-item.component';
import { LeagueSelectorComponent } from '../league-selector/league-selector.component';
import { Logo } from '../../models/logo';

@Component({
  selector: 'app-logo-display',
  standalone: true,
  imports: [CommonModule, FormsModule, LogoItemComponent, LeagueSelectorComponent],
  templateUrl: './logo-display.component.html'
})
export class LogoDisplayComponent implements OnInit {
  searchTerm: string = '';
  selectedLeague: string = 'SUPERLEAGUE';
  logos$: Observable<Logo[]>;
  leagues$: Observable<string[]>;

  private readonly STORAGE_KEY = 'gfl_selected_league';

  constructor(
    private logoService: LogoService,
    private structuredDataService: StructuredDataService
  ) {
    if (typeof localStorage !== 'undefined') {
      const savedLeague = localStorage.getItem(this.STORAGE_KEY);
      if (savedLeague !== null) {
        this.selectedLeague = savedLeague;
      }
    }

    this.logos$ = this.logoService.getLogos();
    this.leagues$ = this.logoService.getLeagues();
  }

  ngOnInit() {
    this.applyFilters();
    this.injectStructuredData();
  }

  private injectStructuredData(): void {
    // Inject website and organization structured data
    this.structuredDataService.injectMultipleStructuredData([
      this.structuredDataService.generateWebsiteStructuredData(),
      this.structuredDataService.generateOrganizationStructuredData()
    ]);
  }

  applyFilters() {
    this.logos$ = this.logoService.getLogos().pipe(
      map(logos => {
        return logos.filter(logo => {
          const matchesSearch = !this.searchTerm ||
            this.normalizeString(logo.name).includes(this.normalizeString(this.searchTerm));
          const matchesLeague = !this.selectedLeague || logo.league === this.selectedLeague;
          return matchesSearch && matchesLeague;
        });
      })
    );
  }

  clearSearch() {
    this.searchTerm = '';
    this.applyFilters();
  }

  clearAllFilters() {
    this.searchTerm = '';
    this.selectedLeague = '';
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.STORAGE_KEY);
    }
    this.applyFilters();
  }

  onLeagueChange(league: string) {
    this.selectedLeague = league;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, league);
    }
    this.applyFilters();
  }

  getLeagueLogoPath(leagueName: string): string {
    return this.logoService.getLeagueLogoPath(leagueName);
  }

  private normalizeString(str: string): string {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9α-ωά-ώ\s]/g, '');
  }
}