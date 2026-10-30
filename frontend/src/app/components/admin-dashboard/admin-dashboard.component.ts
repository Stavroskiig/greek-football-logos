import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject, Subscription, forkJoin, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, catchError, switchMap } from 'rxjs/operators';
import { TeamService } from '../../services/team.service';
import { StadiumService } from '../../services/stadium.service';
import { CollectionService } from '../../services/collection.service';
import { TagService } from '../../services/tag.service';
import { LogoSuggestionService, LogoSuggestion, SuggestionAuditLog } from '../../services/logo-suggestion.service';
import { Team, Stadium } from '../../models/team';
import { League } from '../../models/league';
import { environment } from '../../../environments/environment';

import { TranslatePipe } from '@ngx-translate/core';

export interface DashboardStats {
  totalTeams: number;
  totalLogosManifest: number;
  totalStadiums: number;
  mappedStadiumsGps: number;
  totalCollections: number;
  totalTags: number;
  totalLeagues: number;
  pendingSuggestions: number;
}

export interface BackendHealth {
  status: 'checking' | 'healthy' | 'unreachable';
  latencyMs?: number;
  message?: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslatePipe],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  isLoadingStats: boolean = true;
  stats: DashboardStats = {
    totalTeams: 0,
    totalLogosManifest: 0,
    totalStadiums: 0,
    mappedStadiumsGps: 0,
    totalCollections: 0,
    totalTags: 0,
    totalLeagues: 0,
    pendingSuggestions: 0
  };

  backendHealth: BackendHealth = { status: 'checking' };
  currentDate: Date = new Date();

  // Quick Team Search
  quickSearchTerm: string = '';
  searchResults: Team[] = [];
  isSearching: boolean = false;
  private searchSubject = new Subject<string>();
  private searchSub?: Subscription;

  // Suggestions & Submissions
  suggestions: LogoSuggestion[] = [];
  filterSuggestionStatus: 'PENDING' | 'ALL' | 'AUDIT' = 'PENDING';
  isLoadingSuggestions: boolean = false;
  updatingSuggestionId: number | null = null;
  suggestionActionMessage: string | null = null;

  // Audit Logs
  auditLogs: SuggestionAuditLog[] = [];
  isLoadingAuditLogs: boolean = false;

  // DB Sync
  isSyncing: boolean = false;
  syncMessage: string | null = null;
  syncSuccess: boolean = false;

  constructor(
    private teamService: TeamService,
    private stadiumService: StadiumService,
    private collectionService: CollectionService,
    private tagService: TagService,
    private logoSuggestionService: LogoSuggestionService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkBackendHealth();
    this.loadAllStats();
    this.loadSuggestions();
    this.setupQuickSearch();
  }

  ngOnDestroy(): void {
    if (this.searchSub) {
      this.searchSub.unsubscribe();
    }
  }

  checkBackendHealth(): void {
    this.backendHealth = { status: 'checking' };
    const startTime = performance.now();

    this.http.get(`${environment.apiUrl}/health`, { responseType: 'text' }).pipe(
      catchError(err => {
        return of(null);
      })
    ).subscribe(res => {
      const elapsed = Math.round(performance.now() - startTime);
      if (res !== null) {
        this.backendHealth = {
          status: 'healthy',
          latencyMs: elapsed,
          message: typeof res === 'string' ? res : 'Online & Healthy'
        };
      } else {
        this.backendHealth = {
          status: 'unreachable',
          message: 'Backend server not responding or proxy timeout'
        };
      }
    });
  }

  loadAllStats(): void {
    this.isLoadingStats = true;

    forkJoin({
      teamsPage: this.teamService.getTeams(undefined, undefined, 0, 1).pipe(catchError(() => of({ totalElements: 0, content: [] } as any))),
      manifestPaths: this.teamService.getManifestPaths().pipe(catchError(() => of(new Map<string, string>()))),
      stadiums: this.stadiumService.getStadiums().pipe(catchError(() => of([]))),
      collectionsPage: this.collectionService.getCollectionsPage(0, 1).pipe(catchError(() => of({ totalElements: 0, content: [] } as any))),
      tags: this.tagService.getAvailableTags().pipe(catchError(() => of([]))),
      leagues: this.teamService.getLeagues().pipe(catchError(() => of([]))),
      pendingSuggestions: this.logoSuggestionService.getSuggestions(true).pipe(catchError(() => of([])))
    }).subscribe({
      next: ({ teamsPage, manifestPaths, stadiums, collectionsPage, tags, leagues, pendingSuggestions }) => {
        const mappedGps = (stadiums || []).filter((s: Stadium) => s.latitude && s.longitude).length;

        this.stats = {
          totalTeams: teamsPage?.totalElements || 0,
          totalLogosManifest: manifestPaths?.size || 0,
          totalStadiums: stadiums?.length || 0,
          mappedStadiumsGps: mappedGps,
          totalCollections: collectionsPage?.totalElements || 0,
          totalTags: tags?.length || 0,
          totalLeagues: leagues?.length || 0,
          pendingSuggestions: pendingSuggestions?.length || 0
        };
        this.isLoadingStats = false;
      },
      error: (err) => {
        console.error('Failed to load dashboard stats:', err);
        this.isLoadingStats = false;
      }
    });
  }

  setupQuickSearch(): void {
    this.searchSub = this.searchSubject.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      switchMap(term => {
        const trimmed = term.trim();
        if (!trimmed) {
          this.isSearching = false;
          return of([]);
        }
        this.isSearching = true;
        return this.teamService.getTeams(undefined, trimmed, 0, 6).pipe(
          catchError(() => of({ content: [] } as any))
        );
      })
    ).subscribe((result: any) => {
      this.isSearching = false;
      this.searchResults = result?.content || [];
    });
  }

  onQuickSearchInput(term: string): void {
    this.searchSubject.next(term);
  }

  clearQuickSearch(): void {
    this.quickSearchTerm = '';
    this.searchResults = [];
    this.isSearching = false;
  }

  navigateToTeam(team: Team): void {
    this.clearQuickSearch();
    this.router.navigate(['/admin/teams'], { queryParams: { search: team.name } });
  }

  loadSuggestions(): void {
    this.isLoadingSuggestions = true;
    const pendingOnly = this.filterSuggestionStatus === 'PENDING';

    this.logoSuggestionService.getSuggestions(pendingOnly).pipe(
      catchError(err => {
        console.warn('Could not load suggestions from backend:', err);
        return of([]);
      })
    ).subscribe((suggestions: LogoSuggestion[]) => {
      this.suggestions = suggestions || [];
      if (pendingOnly) {
        this.stats.pendingSuggestions = this.suggestions.length;
      }
      this.isLoadingSuggestions = false;
    });
  }

  loadAuditLogs(): void {
    this.isLoadingAuditLogs = true;
    this.logoSuggestionService.getAuditLogs().pipe(
      catchError(err => {
        console.warn('Could not load audit logs from backend:', err);
        return of([]);
      })
    ).subscribe((logs: SuggestionAuditLog[]) => {
      this.auditLogs = logs || [];
      this.isLoadingAuditLogs = false;
    });
  }

  setSuggestionFilter(status: 'PENDING' | 'ALL' | 'AUDIT'): void {
    this.filterSuggestionStatus = status;
    if (status === 'AUDIT') {
      this.loadAuditLogs();
    } else {
      this.loadSuggestions();
    }
  }

  updateSuggestionStatus(suggestion: LogoSuggestion, newStatus: 'APPROVED' | 'REJECTED'): void {
    if (!suggestion.id) return;
    this.updatingSuggestionId = suggestion.id;

    this.logoSuggestionService.updateSuggestionStatus(suggestion.id, newStatus).subscribe({
      next: (updated) => {
        suggestion.status = newStatus;
        this.updatingSuggestionId = null;
        this.suggestionActionMessage = `Suggestion for "${suggestion.teamName}" marked as ${newStatus.toLowerCase()}.`;
        if (this.filterSuggestionStatus === 'PENDING') {
          this.suggestions = this.suggestions.filter(s => s.id !== suggestion.id);
          this.stats.pendingSuggestions = Math.max(0, this.stats.pendingSuggestions - 1);
        }
        setTimeout(() => this.suggestionActionMessage = null, 4000);
      },
      error: (err) => {
        console.error('Failed to update suggestion status:', err);
        this.updatingSuggestionId = null;
      }
    });
  }

  deleteSuggestion(suggestion: LogoSuggestion): void {
    if (!suggestion.id) return;
    if (!confirm(`Are you sure you want to delete suggestion for "${suggestion.teamName}"?`)) return;

    this.updatingSuggestionId = suggestion.id;
    this.logoSuggestionService.deleteSuggestion(suggestion.id).subscribe({
      next: () => {
        this.suggestions = this.suggestions.filter(s => s.id !== suggestion.id);
        if (suggestion.status === 'PENDING') {
          this.stats.pendingSuggestions = Math.max(0, this.stats.pendingSuggestions - 1);
        }
        this.updatingSuggestionId = null;
        this.suggestionActionMessage = `Suggestion deleted.`;
        setTimeout(() => this.suggestionActionMessage = null, 3000);
      },
      error: (err) => {
        console.error('Failed to delete suggestion:', err);
        this.updatingSuggestionId = null;
      }
    });
  }

  openUploadWithSuggestion(suggestion: LogoSuggestion): void {
    const queryParams: any = {
      teamName: suggestion.teamName,
      folder: suggestion.eps || 'SUPERLEAGUE'
    };
    if (suggestion.teamId) {
      queryParams.teamId = suggestion.teamId;
    }
    this.router.navigate(['/admin/upload-logo'], { queryParams });
  }

  async runSyncLogosDb(): Promise<void> {
    if (this.isSyncing) return;
    this.isSyncing = true;
    this.syncMessage = 'Fetching logos manifest and synchronizing database...';
    this.syncSuccess = false;

    try {
      const manifestResponse = await fetch('/assets/logos-manifest.json?t=' + new Date().getTime());
      if (!manifestResponse.ok) {
        throw new Error('Could not fetch local logos-manifest.json');
      }
      const manifestData = await manifestResponse.json();

      const response = await import('rxjs').then(rxjs => rxjs.firstValueFrom(this.teamService.syncTeams(manifestData)));
      this.syncSuccess = true;
      this.syncMessage = `Sync successful! ${response.addedCount} new logo(s) added into the database.`;
      this.loadAllStats();
    } catch (err: any) {
      console.error('Logo sync error:', err);
      this.syncSuccess = false;
      this.syncMessage = `Sync failed: ${err.message || 'Unknown error. Check console.'}`;
    } finally {
      this.isSyncing = false;
      setTimeout(() => {
        this.syncMessage = null;
      }, 7000);
    }
  }
}
