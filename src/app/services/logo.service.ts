import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay, tap } from 'rxjs/operators';
import { TeamLogo } from '../models/team-logo';

@Injectable({
  providedIn: 'root',
})
export class LogoService {
  private allLogos$: Observable<TeamLogo[]>;
  private defaultLeague = 'superleague';

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) {
    let manifestPath: string;

    if (isPlatformBrowser(this.platformId)) {
      // Browser path
      manifestPath = '/assets/logos-manifest.json';
    } else {
      // Server path
      manifestPath = `${process.cwd()}/dist/greek-football-logos/browser/assets/logos-manifest.json`;
    }

    this.allLogos$ = this.http.get<Omit<TeamLogo, 'id'>[]>(manifestPath).pipe(
      map(logos => logos.map(logo => ({
        ...logo,
        id: this.generateId(logo.name)
      }))),
      catchError((error) => {
        console.error('Error loading logos:', error);
        return of([]);
      }),
      shareReplay(1)
    );
  }

  private generateId(name: string): string {
    // Map of Greek team names to their simple IDs
    const teamIdMap: { [key: string]: string } = {
      'ΑΟ ΠΑΝΑΘΗΝΑΙΚΟΣ': 'panathinaikos',
      'ΑΕΚ': 'aek',
      'ΠΑΟΚ': 'paok',
      'ΣΦΠ ΟΛΥΜΠΙΑΚΟΣ': 'olympiakos',
      'ΑΣ ΑΡΗΣ ΘΕΣΣΑΛΟΝΙΚΗΣ': 'aris',
      'ΠΑΣ ΛΑΜΙΑ': 'lamia',
      'ΟΦΗ': 'ofi',
      'ΝΠΣ ΒΟΛΟΣ': 'volos',
      'ΑΓΣ ΑΣΤΕΡΑΣ ΤΡΙΠΟΛΗΣ': 'asteras-tripolis',
      'ΓΦΣ ΠΑΝΑΙΤΩΛΙΚΟΣ': 'panetolikos',
      'ΑΠΣ ΑΤΡΟΜΗΤΟΣ ΑΘΗΝΩΝ': 'atromitos',
      'ΜΓΣ ΠΑΝΣΕΡΡΑΪΚΟΣ': 'panserraikos',
      'ΓΣ ΚΑΛΛΙΘΕΑ': 'kallithea',
      'ΑΠΟ ΛΕΒΑΔΕΙΑΚΟΣ': 'levadiakos'
    };

    // Return the mapped ID if it exists, otherwise generate one from the name
    return teamIdMap[name] || name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }

  getLogosManifest(): Observable<TeamLogo[]> {
    return this.allLogos$;
  }

  getLogos(league?: string, searchTerm?: string): Observable<TeamLogo[]> {
    return this.allLogos$.pipe(
      map((logos) => {
        let result = [...logos];

        // Only filter by league if one is selected
        if (league) {
          result = result.filter((logo) =>
            (logo.league || '').toUpperCase() === league.toUpperCase()
          );
        }

        if (searchTerm) {
          const term = searchTerm
            .toUpperCase()
            .normalize('NFKC'); // Use NFKC normalization for better Greek character handling
          
          result = result.filter((logo) => {
            const name = logo.name
              .toUpperCase()
              .normalize('NFKC'); // Use NFKC normalization for better Greek character handling
            return name.includes(term);
          });
        }

        return result;
      })
    );
  }

  getLeagues(): Observable<string[]> {
    return this.allLogos$.pipe(
      map((logos) => {
        const leagues = [...new Set(logos.map((logo) => logo.league || 'Uncategorized'))];
        
        // Custom sorting: SUPERLEAGUE, SUPERLEAGUE 2, Γ ΕΘΝΙΚΗ first, then alphabetical
        return leagues.sort((a, b) => {
          // Define priority order
          const priorityOrder = ['SUPERLEAGUE', 'SUPERLEAGUE 2', 'Γ ΕΘΝΙΚΗ'];
          
          const aIndex = priorityOrder.indexOf(a);
          const bIndex = priorityOrder.indexOf(b);
          
          // If both are in priority list, sort by their position
          if (aIndex !== -1 && bIndex !== -1) {
            return aIndex - bIndex;
          }
          
          // If only a is in priority list, a comes first
          if (aIndex !== -1) {
            return -1;
          }
          
          // If only b is in priority list, b comes first
          if (bIndex !== -1) {
            return 1;
          }
          
          // If neither is in priority list, sort alphabetically
          return a.localeCompare(b);
        });
      })
    );
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

  getAllLogos(): Observable<TeamLogo[]> {
    return this.http.get<TeamLogo[]>('/api/logos'); // Adjust the API endpoint as needed
  }
}