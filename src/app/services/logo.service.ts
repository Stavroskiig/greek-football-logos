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

    this.allLogos$ = this.http.get<TeamLogo[]>(manifestPath).pipe(
      catchError((error) => {
        console.error('Error loading logos:', error);
        return of([]);
      }),
      shareReplay(1)
    );
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
            logo.league.toUpperCase() === league.toUpperCase()
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
        const leagues = [...new Set(logos.map((logo) => logo.league))];
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