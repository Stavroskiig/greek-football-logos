import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable, of, forkJoin } from 'rxjs';
import { catchError, map, shareReplay, tap, retry } from 'rxjs/operators';
import { Team } from '../models/team';
import { League } from '../models/league';
import { TagService } from './tag.service';

import { environment } from '../../environments/environment';

export interface Page<T> {
  content: T[];
  pageable: any;
  last: boolean;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  sort: any;
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class TeamService {
  private apiUrl = `${environment.apiUrl}/teams`;

  private manifestPaths$!: Observable<Map<string, string>>;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
    private tagService: TagService
  ) {
    this.initManifestPaths();
  }

  private initManifestPaths() {
    const timestamp = new Date().getTime();
    this.manifestPaths$ = this.http.get<any[]>(`/assets/logos-manifest.json?t=${timestamp}`).pipe(
      map(manifest => {
        const pathMap = new Map<string, string>();
        manifest.forEach(item => {
          pathMap.set(item.name, item.path);
        });
        return pathMap;
      }),
      catchError(err => {
        console.error('Failed to load logos-manifest.json for path mapping', err);
        return of(new Map<string, string>());
      }),
      shareReplay(1)
    );
  }

  getManifestPaths(): Observable<Map<string, string>> {
    return this.manifestPaths$;
  }

  getTeams(league?: string, searchTerm?: string, page: number = 0, size: number = 50, forceRefresh: boolean = false): Observable<Page<Team>> {
    let url = `${this.apiUrl}?page=${page}&size=${size}`;
    if (league) url += `&league=${encodeURIComponent(league)}`;
    if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;
    if (forceRefresh && isPlatformBrowser(this.platformId)) {
      sessionStorage.setItem('force_refresh_timestamp', new Date().getTime().toString());
    }

    let timestamp = '';
    if (isPlatformBrowser(this.platformId)) {
      timestamp = sessionStorage.getItem('force_refresh_timestamp') || '';
    }

    if (forceRefresh || timestamp) {
      const t = forceRefresh ? new Date().getTime() : timestamp;
      url += `&t=${t}`;
    }
    return forkJoin({
      pageData: this.http.get<Page<Team>>(url).pipe(retry({ count: 3, delay: 2000 })),
      manifestPaths: this.manifestPaths$
    }).pipe(
      map(({ pageData, manifestPaths }) => {
        // Handle local cache poisoning during transition (if browser cached the old backend's flat array)
        if (Array.isArray(pageData)) {
          pageData = {
            content: pageData,
            totalElements: pageData.length,
            totalPages: 1,
            last: true,
            size: pageData.length,
            number: 0
          } as any as Page<Team>;
        }

        // Hydrate tags and overwrite DB path with physical path from manifest
        pageData.content = pageData.content.map((Team: Team) => ({
          ...Team,
          path: manifestPaths.get(Team.name) || Team.primaryLogo?.path,
          tags: this.tagService.getTeamTags(Team.id)
        }));
        return pageData as Page<Team>;
      }),
      catchError((error) => {
        console.error('Error loading paginated Teams:', error);
        // Return empty page structure on error
        return of({ content: [], last: true, empty: true, totalElements: 0, totalPages: 0, size: size, number: page } as any as Page<Team>);
      })
    );
  }

  getTeamsByIds(ids: string[], searchTerm?: string, page: number = 0, size: number = 50): Observable<Page<Team>> {
    let url = `${this.apiUrl}/by-ids?page=${page}&size=${size}`;
    if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;

    return forkJoin({
      pageData: this.http.post<Page<Team>>(url, ids).pipe(retry({ count: 3, delay: 2000 })),
      manifestPaths: this.manifestPaths$
    }).pipe(
      map(({ pageData, manifestPaths }) => {
        // Hydrate tags and overwrite DB path with physical path from manifest
        pageData.content = pageData.content.map((Team: Team) => ({
          ...Team,
          path: manifestPaths.get(Team.name) || Team.primaryLogo?.path,
          tags: this.tagService.getTeamTags(Team.id)
        }));
        return pageData as Page<Team>;
      }),
      catchError((error) => {
        console.error('Error loading paginated Teams by ids:', error);
        return of({ content: [], last: true, empty: true, totalElements: 0, totalPages: 0, size: size, number: page } as any as Page<Team>);
      })
    );
  }

  deleteTeam(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  syncTeams(manifestData: any[]): Observable<{ message: string; addedCount: number }> {
    return this.http.post<{ message: string; addedCount: number }>(`${this.apiUrl}/sync`, manifestData);
  }

  getLeagues(): Observable<League[]> {
    return this.http.get<League[]>(`${environment.apiUrl}/leagues`).pipe(
      retry({ count: 3, delay: 2000 }),
      shareReplay(1)
    );
  }

  getLeagueTeamPath(leagueName: string): string {
    // Map league names to their Team file names
    const leagueTeamMap: { [key: string]: string } = {
      'SUPERLEAGUE': 'SUPERLEAGUE.png',
      'SUPERLEAGUE 2': 'SUPERLEAGUE 2.png',
      'Γ ΕΘΝΙΚΗ': 'Γ ΕΘΝΙΚΗ.png',
      'ΕΠΣ ΑΘΗΝΩΝ': 'ΕΠΣ ΑΘΗΝΩΝ.png',
      'ΕΠΣ ΠΕΙΡΑΙΑ': 'ΕΠΣ ΠΕΙΡΑΙΑ.png',
      'ΕΠΣ ΑΝΑΤΟΛΙΚΗΣ ΑΤΤΙΚΗΣ': 'ΕΠΣ ΑΝΑΤΟΛΙΚΗΣ ΑΤΤΙΚΗΣ.png',
      'ΕΠΣ ΔΥΤΙΚΗΣ ΑΤΤΙΚΗΣ': 'ΕΠΣ ΔΥΤΙΚΗΣ ΑΤΤΙΚΗΣ.png',
      'ΕΠΣ ΑΙΤΩΛΟΑΚΑΡΝΑΝΙΑΣ': 'ΕΠΣ ΑΙΤΩΛΟΑΚΑΡΝΑΝΙΑΣ.png',
      'ΕΠΣ ΑΡΓΟΛΙΔΑΣ': 'ΕΠΣ ΑΡΓΟΛΙΔΑΣ.png',
      'ΕΠΣ ΑΡΚΑΔΙΑΣ': 'ΕΠΣ ΑΡΚΑΔΙΑΣ.png',
      'ΕΠΣ ΑΡΤΑΣ': 'ΕΠΣ ΑΡΤΑΣ.png',
      'ΕΠΣ ΑΧΑΪΑΣ': 'ΕΠΣ ΑΧΑΪΑΣ.png',
      'ΕΠΣ ΒΟΙΩΤΙΑΣ': 'ΕΠΣ ΒΟΙΩΤΙΑΣ.png',
      'ΕΠΣ ΔΡΑΜΑΣ': 'ΕΠΣ ΔΡΑΜΑΣ.png',
      'ΕΠΣ ΔΩΔΕΚΑΝΗΣΟΥ': 'ΕΠΣ ΔΩΔΕΚΑΝΗΣΟΥ.png',
      'ΕΠΣ ΕΒΡΟΥ': 'ΕΠΣ ΕΒΡΟΥ.png',
      'ΕΠΣ ΕΥΒΟΙΑΣ': 'ΕΠΣ ΕΥΒΟΙΑΣ.png',
      'ΕΠΣ ΕΥΡΥΤΑΝΙΑΣ': 'ΕΠΣ ΕΥΡΥΤΑΝΙΑΣ.png',
      'ΕΠΣ ΕΥΡΩΠΑ': 'ΕΠΣ ΕΥΡΩΠΑ.png',
      'ΕΠΣ ΗΛΕΙΑΣ': 'ΕΠΣ ΗΛΕΙΑΣ.png',
      'ΕΠΣ ΗΜΑΘΙΑΣ': 'ΕΠΣ ΗΜΑΘΙΑΣ.png',
      'ΕΠΣ ΗΠΕΙΡΟΥ': 'ΕΠΣ ΗΠΕΙΡΟΥ.png',
      'ΕΠΣ ΗΡΑΚΛΕΙΟΥ': 'ΕΠΣ ΗΡΑΚΛΕΙΟΥ.png',
      'ΕΠΣ ΘΕΣΠΡΩΤΙΑΣ': 'ΕΠΣ ΘΕΣΠΡΩΤΙΑΣ.png',
      'ΕΠΣ ΘΕΣΣΑΛΙΑΣ': 'ΕΠΣ ΘΕΣΣΑΛΙΑΣ.png',
      'ΕΠΣ ΘΡΑΚΗΣ': 'ΕΠΣ ΘΡΑΚΗΣ.png',
      'ΕΠΣ ΚΑΒΑΛΑΣ': 'ΕΠΣ ΚΑΒΑΛΑΣ.png',
      'ΕΠΣ ΚΑΡΔΙΤΣΑΣ': 'ΕΠΣ ΚΑΡΔΙΤΣΑΣ.png',
      'ΕΠΣ ΚΑΣΤΟΡΙΑΣ': 'ΕΠΣ ΚΑΣΤΟΡΙΑΣ.png',
      'ΕΠΣ ΚΕΦΑΛΛΗΝΙΑΣ-ΙΘΑΚΗΣ': 'ΕΠΣ ΚΕΦΑΛΛΗΝΙΑΣ-ΙΘΑΚΗΣ.png',
      'ΕΠΣ ΚΙΛΚΙΣ': 'ΕΠΣ ΚΙΛΚΙΣ.png',
      'ΕΠΣ ΚΟΖΑΝΗΣ': 'ΕΠΣ ΚΟΖΑΝΗΣ.png',
      'ΕΠΣ ΚΟΡΙΝΘΙΑΣ': 'ΕΠΣ ΚΟΡΙΝΘΙΑΣ.png',
      'ΕΠΣ ΚΥΚΛΑΔΩΝ': 'ΕΠΣ ΚΥΚΛΑΔΩΝ.png',
      'ΕΠΣ ΛΑΚΩΝΙΑΣ': 'ΕΠΣ ΛΑΚΩΝΙΑΣ.png',
      'ΕΠΣ ΛΑΡΙΣΑΣ': 'ΕΠΣ ΛΑΡΙΣΑΣ.png',
      'ΕΠΣ ΛΑΣΙΘΙΟΥ': 'ΕΠΣ ΛΑΣΙΘΙΟΥ.png',
      'ΕΠΣ ΛΕΣΒΟΥ-ΛΗΜΝΟΥ': 'ΕΠΣ ΛΕΣΒΟΥ-ΛΗΜΝΟΥ.png',
      'ΕΠΣ ΜΑΚΕΔΟΝΙΑΣ': 'ΕΠΣ ΜΑΚΕΔΟΝΙΑΣ.png',
      'ΕΠΣ ΜΕΣΣΗΝΙΑΣ': 'ΕΠΣ ΜΕΣΣΗΝΙΑΣ.png',
      'ΕΠΣ ΞΑΝΘΗΣ': 'ΕΠΣ ΞΑΝΘΗΣ.png',
      'ΕΠΣ ΠΕΛΛΑΣ': 'ΕΠΣ ΠΕΛΛΑΣ.png',
      'ΕΠΣ ΠΙΕΡΙΑΣ': 'ΕΠΣ ΠΙΕΡΙΑΣ.png',
      'ΕΠΣ ΠΡΕΒΕΖΑΣ-ΛΕΥΚΑΔΑΣ': 'ΕΠΣ ΠΡΕΒΕΖΑΣ-ΛΕΥΚΑΔΑΣ.png',
      'ΕΠΣ ΡΕΘΥΜΝΟΥ': 'ΕΠΣ ΡΕΘΥΜΝΟΥ.png',
      'ΕΠΣ ΣΑΜΟΥ': 'ΕΠΣ ΣΑΜΟΥ.png',
      'ΕΠΣ ΣΕΡΡΩΝ': 'ΕΠΣ ΣΕΡΡΩΝ.png',
      'ΕΠΣ ΤΡΙΚΑΛΩΝ': 'ΕΠΣ ΤΡΙΚΑΛΩΝ.png',
      'ΕΠΣ ΦΘΙΩΤΙΔΑΣ': 'ΕΠΣ ΦΘΙΩΤΙΔΑΣ.png',
      'ΕΠΣ ΦΛΩΡΙΝΑΣ': 'ΕΠΣ ΦΛΩΡΙΝΑΣ.png',
      'ΕΠΣ ΦΩΚΙΔΑΣ': 'ΕΠΣ ΦΩΚΙΔΑΣ.png',
      'ΕΠΣ ΧΑΛΚΙΔΙΚΗΣ': 'ΕΠΣ ΧΑΛΚΙΔΙΚΗΣ.png',
      'ΕΠΣ ΧΑΝΙΩΝ': 'ΕΠΣ ΧΑΝΙΩΝ.png',
      'ΕΠΣ ΧΙΟΥ': 'ΕΠΣ ΧΙΟΥ.png',
      'ΕΠΣ ΖΑΚΥΝΘΟΥ': 'ΕΠΣ ΖΑΚΥΝΘΟΥ.png',
      'ΕΠΣ ΚΕΡΚΥΡΑΣ': 'ΕΠΣ ΚΕΡΚΥΡΑΣ.png',
      'ΕΠΣ ΓΡΕΒΕΝΩΝ': 'ΕΠΣ ΓΡΕΒΕΝΩΝ.png'
    };

    const TeamFileName = leagueTeamMap[leagueName];
    if (TeamFileName) {
      return `/assets/league-Teams/${TeamFileName}`;
    }

    // Return a default Team or null if no mapping exists
    return '/assets/league-Teams/default-league.png';
  }

  getAllTeams(page: number = 0, size: number = 1000, forceRefresh: boolean = false): Observable<Page<Team>> {
    return this.getTeams(undefined, undefined, page, size, forceRefresh);
  }

  getTeamsManifest(): Observable<Team[]> {
    return this.getAllTeams(0, 2000).pipe(map(page => page.content));
  }
}
