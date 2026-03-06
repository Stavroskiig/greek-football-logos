import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay, tap, retry } from 'rxjs/operators';
import { TeamLogo } from '../models/team-logo';
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
export class LogoService {
  private apiUrl = `${environment.apiUrl}/logos`;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
    private tagService: TagService
  ) {
    // Determine leagues once initially (optional optimization: can move to backend)
  }

  getLogos(league?: string, searchTerm?: string, page: number = 0, size: number = 50): Observable<Page<TeamLogo>> {
    let url = `${this.apiUrl}?page=${page}&size=${size}`;
    if (league) url += `&league=${encodeURIComponent(league)}`;
    if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;

    return this.http.get<Page<TeamLogo>>(url).pipe(
      retry({ count: 3, delay: 2000 }),
      map((pageData: any) => {
        // Handle local cache poisoning during transition (if browser cached the old backend's flat array)
        if (Array.isArray(pageData)) {
          pageData = {
            content: pageData,
            totalElements: pageData.length,
            totalPages: 1,
            last: true,
            size: pageData.length,
            number: 0
          } as Page<TeamLogo>;
        }

        // Hydrate tags
        pageData.content = pageData.content.map((logo: TeamLogo) => ({
          ...logo,
          tags: this.tagService.getTeamTags(logo.id)
        }));
        return pageData as Page<TeamLogo>;
      }),
      catchError((error) => {
        console.error('Error loading paginated logos:', error);
        // Return empty page structure on error
        return of({ content: [], last: true, empty: true, totalElements: 0, totalPages: 0, size: size, number: page } as any as Page<TeamLogo>);
      })
    );
  }

  getLogosByIds(ids: string[], searchTerm?: string, page: number = 0, size: number = 50): Observable<Page<TeamLogo>> {
    let url = `${this.apiUrl}/by-ids?page=${page}&size=${size}`;
    if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;

    return this.http.post<Page<TeamLogo>>(url, ids).pipe(
      retry({ count: 3, delay: 2000 }),
      map((pageData: any) => {
        // Hydrate tags
        pageData.content = pageData.content.map((logo: TeamLogo) => ({
          ...logo,
          tags: this.tagService.getTeamTags(logo.id)
        }));
        return pageData as Page<TeamLogo>;
      }),
      catchError((error) => {
        console.error('Error loading paginated logos by ids:', error);
        return of({ content: [], last: true, empty: true, totalElements: 0, totalPages: 0, size: size, number: page } as any as Page<TeamLogo>);
      })
    );
  }

  deleteLogo(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  syncLogos(manifestData: any[]): Observable<{ message: string; addedCount: number }> {
    return this.http.post<{ message: string; addedCount: number }>(`${this.apiUrl}/sync`, manifestData);
  }

  getLeagues(): Observable<string[]> {
    // For now, returning standard list or fetch from distinct API. Hardcoded priority for speed.
    const priorityOrder = ['SUPERLEAGUE', 'SUPERLEAGUE 2', 'Γ ΕΘΝΙΚΗ'];
    const epsLeagues = [
      'ΕΠΣ ΑΘΗΝΩΝ', 'ΕΠΣ ΑΙΤΩΛΟΑΚΑΡΝΑΝΙΑΣ', 'ΕΠΣ ΑΝΑΤΟΛΙΚΗΣ ΑΤΤΙΚΗΣ', 'ΕΠΣ ΑΡΓΟΛΙΔΑΣ', 'ΕΠΣ ΑΡΚΑΔΙΑΣ',
      'ΕΠΣ ΑΡΤΑΣ', 'ΕΠΣ ΑΧΑΪΑΣ', 'ΕΠΣ ΒΟΙΩΤΙΑΣ', 'ΕΠΣ ΓΡΕΒΕΝΩΝ', 'ΕΠΣ ΔΡΑΜΑΣ', 'ΕΠΣ ΔΥΤΙΚΗΣ ΑΤΤΙΚΗΣ',
      'ΕΠΣ ΔΩΔΕΚΑΝΗΣΟΥ', 'ΕΠΣ ΕΒΡΟΥ', 'ΕΠΣ ΕΥΒΟΙΑΣ', 'ΕΠΣ ΕΥΡΥΤΑΝΙΑΣ', 'ΕΠΣ ΕΥΡΩΠΑ', 'ΕΠΣ ΗΛΕΙΑΣ',
      'ΕΠΣ ΗΜΑΘΙΑΣ', 'ΕΠΣ ΗΠΕΙΡΟΥ', 'ΕΠΣ ΗΡΑΚΛΕΙΟΥ', 'ΕΠΣ ΘΕΣΠΡΩΤΙΑΣ', 'ΕΠΣ ΘΕΣΣΑΛΙΑΣ', 'ΕΠΣ ΘΡΑΚΗΣ',
      'ΕΠΣ ΚΑΒΑΛΑΣ', 'ΕΠΣ ΚΑΡΔΙΤΣΑΣ', 'ΕΠΣ ΚΑΣΤΟΡΙΑΣ', 'ΕΠΣ ΚΕΡΚΥΡΑΣ', 'ΕΠΣ ΚΕΦΑΛΛΗΝΙΑΣ-ΙΘΑΚΗΣ',
      'ΕΠΣ ΚΙΛΚΙΣ', 'ΕΠΣ ΚΟΖΑΝΗΣ', 'ΕΠΣ ΚΟΡΙΝΘΙΑΣ', 'ΕΠΣ ΚΥΚΛΑΔΩΝ', 'ΕΠΣ ΛΑΚΩΝΙΑΣ', 'ΕΠΣ ΛΑΡΙΣΑΣ',
      'ΕΠΣ ΛΑΣΙΘΙΟΥ', 'ΕΠΣ ΛΕΣΒΟΥ-ΛΗΜΝΟΥ', 'ΕΠΣ ΜΑΚΕΔΟΝΙΑΣ', 'ΕΠΣ ΜΕΣΣΗΝΙΑΣ', 'ΕΠΣ ΞΑΝΘΗΣ', 'ΕΠΣ ΠΕΙΡΑΙΑ',
      'ΕΠΣ ΠΕΛΛΑΣ', 'ΕΠΣ ΠΙΕΡΙΑΣ', 'ΕΠΣ ΠΡΕΒΕΖΑΣ-ΛΕΥΚΑΔΑΣ', 'ΕΠΣ ΡΕΘΥΜΝΟΥ', 'ΕΠΣ ΣΑΜΟΥ', 'ΕΠΣ ΣΕΡΡΩΝ',
      'ΕΠΣ ΤΡΙΚΑΛΩΝ', 'ΕΠΣ ΦΘΙΩΤΙΔΑΣ', 'ΕΠΣ ΦΛΩΡΙΝΑΣ', 'ΕΠΣ ΦΩΚΙΔΑΣ', 'ΕΠΣ ΧΑΛΚΙΔΙΚΗΣ', 'ΕΠΣ ΧΑΝΙΩΝ', 'ΕΠΣ ΧΙΟΥ'
    ];
    return of([...priorityOrder, ...epsLeagues]);
  }

  getLeagueLogoPath(leagueName: string): string {
    // Map league names to their logo file names
    const leagueLogoMap: { [key: string]: string } = {
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

    const logoFileName = leagueLogoMap[leagueName];
    if (logoFileName) {
      return `/assets/league-logos/${logoFileName}`;
    }

    // Return a default logo or null if no mapping exists
    return '/assets/league-logos/default-league.png';
  }

  getAllLogos(page: number = 0, size: number = 1000): Observable<Page<TeamLogo>> {
    return this.getLogos(undefined, undefined, page, size);
  }

  getLogosManifest(): Observable<TeamLogo[]> {
    return this.getAllLogos(0, 2000).pipe(map(page => page.content));
  }
}