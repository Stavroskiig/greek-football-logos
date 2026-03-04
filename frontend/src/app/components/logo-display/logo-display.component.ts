import { Component, OnInit, HostListener, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LogoService } from '../../services/logo.service';
import { StructuredDataService } from '../../services/structured-data.service';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LogoItemComponent } from '../logo-item/logo-item.component';
import { LeagueSelectorComponent } from '../league-selector/league-selector.component';
import { TeamLogo } from '../../models/team-logo';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-logo-display',
  standalone: true,
  imports: [CommonModule, FormsModule, LogoItemComponent, LeagueSelectorComponent, TranslatePipe],
  templateUrl: './logo-display.component.html'
})
export class LogoDisplayComponent implements OnInit, OnDestroy {
  searchTerm: string = '';
  selectedLeague: string = 'SUPERLEAGUE';

  logos: TeamLogo[] = [];
  leagues$: Observable<string[]>;

  // Pagination state
  currentPage: number = 0;
  pageSize: number = 50;
  hasMore: boolean = true;
  isLoading: boolean = false;
  totalElements: number = 0;

  private destroy$ = new Subject<void>();

  private readonly STORAGE_KEY = 'gfl_selected_league';

  constructor(
    private logoService: LogoService,
    private structuredDataService: StructuredDataService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      const savedLeague = localStorage.getItem(this.STORAGE_KEY);
      if (savedLeague !== null) {
        this.selectedLeague = savedLeague;
      }
    }

    this.leagues$ = this.logoService.getLeagues();
  }

  ngOnInit() {
    this.loadLogos(true);
    this.injectStructuredData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private injectStructuredData(): void {
    // Inject website and organization structured data
    this.structuredDataService.injectMultipleStructuredData([
      this.structuredDataService.generateWebsiteStructuredData(),
      this.structuredDataService.generateOrganizationStructuredData()
    ]);
  }

  applyFilters() {
    this.loadLogos(true);
  }

  loadLogos(reset: boolean = false) {
    if (this.isLoading) return;

    if (reset) {
      this.currentPage = 0;
      this.logos = [];
      this.hasMore = true;
    }

    if (!this.hasMore) return;

    this.isLoading = true;

    this.logoService.getLogos(
      this.selectedLeague,
      this.searchTerm,
      this.currentPage,
      this.pageSize
    ).pipe(takeUntil(this.destroy$)).subscribe({
      next: (page) => {
        if (reset) {
          this.logos = page.content;
        } else {
          // Append specific new logos without duplicating
          const newSet = new Set(this.logos.map(l => l.id));
          const uniqueNew = page.content.filter(l => !newSet.has(l.id));
          this.logos = [...this.logos, ...uniqueNew];
        }

        this.totalElements = page.totalElements;
        this.hasMore = !page.last && page.content.length > 0;
        this.currentPage++;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.hasMore = false;
      }
    });
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(event: Event) {
    if (isPlatformBrowser(this.platformId)) {
      const windowHeight = 'innerHeight' in window ? window.innerHeight : document.documentElement.offsetHeight;
      const body = document.body;
      const html = document.documentElement;
      const docHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
      const windowBottom = windowHeight + window.pageYOffset;

      // Load more if we are within 500px of the bottom
      if (windowBottom >= docHeight - 500) {
        this.loadLogos();
      }
    }
  }

  clearSearch() {
    this.searchTerm = '';
    this.applyFilters();
  }

  clearAllFilters() {
    this.searchTerm = '';
    this.selectedLeague = '';
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.STORAGE_KEY);
    }
    this.applyFilters();
  }

  onLeagueChange(league: string) {
    this.selectedLeague = league;
    if (isPlatformBrowser(this.platformId)) {
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