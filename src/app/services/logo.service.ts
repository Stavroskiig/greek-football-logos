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
          const term = searchTerm.toLowerCase();
          result = result.filter((logo) =>
            logo.name.toLowerCase().includes(term)
          );
        }

        return result;
      })
    );
  }

  getLeagues(): Observable<string[]> {
    return this.allLogos$.pipe(
      map((logos) => {
        const leagues = [...new Set(logos.map((logo) => logo.league || 'Uncategorized'))];
        // Move Superleague to front if it exists
        return leagues.sort((a, b) =>
          a === 'SUPERLEAGUE'
            ? -1
            : b === 'SUPERLEAGUE'
            ? 1
            : a.localeCompare(b)
        );
      })
    );
  }

  getAllLogos(): Observable<TeamLogo[]> {
    return this.http.get<TeamLogo[]>('/api/logos'); // Adjust the API endpoint as needed
  }
}