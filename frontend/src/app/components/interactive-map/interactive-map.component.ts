import { Component, AfterViewInit, Inject, PLATFORM_ID, ElementRef, ViewChild, OnDestroy, effect, Injector } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { TranslateService } from '@ngx-translate/core';
import { ThemeService } from '../../services/theme.service';
import { LogoService } from '../../services/logo.service';
import * as L from 'leaflet';

// Types for our locations JSON
interface TeamLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  region: string;
  league: string;
  founded: number;
  historyKey: string;
}

@Component({
  selector: 'app-interactive-map',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './interactive-map.component.html',
  styleUrls: ['./interactive-map.component.css']
})
export class InteractiveMapComponent implements AfterViewInit, OnDestroy {
  @ViewChild('map', { static: true }) mapContainer!: ElementRef;

  private map!: L.Map;
  private isBrowser: boolean;
  private geoJsonLayer?: L.GeoJSON;
  private markers: L.Marker[] = [];
  private baseLocations: TeamLocation[] = [];
  private allLocations: TeamLocation[] = []; // Store all teams locally
  private markerLayerGroup!: L.LayerGroup; // Group to manage active markers

  activeLeague: string = 'SUPERLEAGUE';
  availableLeagues: string[] = ['SUPERLEAGUE', 'SUPERLEAGUE 2', 'Γ ΕΘΝΙΚΗ'];

  selectedTeam: TeamLocation | null = null;
  selectedTeamLogoUrl: string = '';

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private http: HttpClient,
    private translate: TranslateService,
    private themeService: ThemeService,
    private logoService: LogoService,
    private injector: Injector
  ) {
    this.isBrowser = isPlatformBrowser(platformId);

    if (this.isBrowser) {
      effect(() => {
        const isDark = this.themeService.isDarkMode();
        if (this.map) {
          this.setTileLayer(isDark);
          if (this.geoJsonLayer) {
            this.geoJsonLayer.setStyle(this.getRegionStyle(isDark));
          }
        }
      }, { injector: this.injector });
    }
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;
    this.initMap();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private initMap(): void {
    const greeceBounds = L.latLngBounds(
      L.latLng(34.0, 19.0),
      L.latLng(42.0, 30.0)
    );

    this.map = L.map(this.mapContainer.nativeElement, {
      center: [38.3749, 23.8103],
      zoom: 7,
      minZoom: 7,
      maxBounds: greeceBounds,
      maxBoundsViscosity: 1.0,
      zoomControl: false,
    });

    this.markerLayerGroup = L.layerGroup().addTo(this.map);
    L.control.zoom({ position: 'bottomright' }).addTo(this.map);
    this.setTileLayer(this.themeService.isDarkMode());

    this.http.get('assets/map/greece-regions.geojson').subscribe({
      next: (geoData: any) => {
        this.geoJsonLayer = L.geoJSON(geoData, {
          style: (feature) => this.getRegionStyle(this.themeService.isDarkMode())
        }).addTo(this.map);
      },
      error: (err) => console.error('Error loading Greece GeoJSON', err)
    });

    this.http.get<TeamLocation[]>('assets/data/team-locations.json').subscribe({
      next: (locations) => {
        this.baseLocations = locations;
        this.loadTeamsForLeague(this.activeLeague);
      },
      error: (err) => console.error('Error loading team locations', err)
    });
  }

  private getLeagueId(leagueName: string): string {
    switch (leagueName) {
      case 'SUPERLEAGUE': return 'superleague';
      case 'SUPERLEAGUE 2': return 'superleague-2';
      case 'Γ ΕΘΝΙΚΗ': return 'γ-εθνικη';
      default: 
        return leagueName.toLowerCase()
          .replace(/[\u0300-\u036f]/g, "") // remove diacritics
          .replace(/[^a-z0-9α-ωά-ώ]+/g, "-")
          .replace(/^-+|-+$/g, "");
    }
  }

  private loadTeamsForLeague(league: string): void {
    const leagueId = this.getLeagueId(league);
    // Fetch all logos for the selected league from the database
    this.logoService.getLogos(leagueId, undefined, 0, 1000).subscribe({
      next: (dbLogos) => {
        // Create a map of team locations by name/id for quick lookup
        const locationMap = new Map<string, TeamLocation>();
        this.baseLocations.forEach(loc => {
          locationMap.set(loc.id, loc);
          locationMap.set(loc.name, loc);
        });

        // Filter and map DB logos to locations that exist in our static JSON
        this.allLocations = [];
        dbLogos.content.forEach(logo => {
          const loc = locationMap.get(logo.id) || locationMap.get(logo.name);
          if (loc) {
            this.allLocations.push({
              ...loc,
              league: logo.league?.name || league,
              dynamicPath: logo.path
            } as TeamLocation & { dynamicPath?: string });
          }
        });

        this.filterMarkers();
      },
      error: (err) => console.error('Error loading teams for league', err)
    });
  }

  private setTileLayer(isDark: boolean): void {
    if (!this.map) return;
    this.map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        this.map.removeLayer(layer);
      }
    });

    const tileUrl = isDark
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

    L.tileLayer(tileUrl, {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(this.map);
  }

  private getRegionStyle(isDark: boolean): L.PathOptions {
    return {
      fillColor: isDark ? '#1e3a8a' : '#3b82f6',
      weight: 1.5,
      opacity: 0.8,
      color: isDark ? '#1e40af' : '#93c5fd',
      fillOpacity: isDark ? 0.3 : 0.15,
      interactive: false
    };
  }

  setLeague(league: string): void {
    if (this.activeLeague === league) return;
    
    this.activeLeague = league;
    this.closeSidebar();
    
    // Instead of just filtering statically, fetch the latest DB state for this league
    this.loadTeamsForLeague(league);
  }

  private filterMarkers(): void {
    if (!this.map || !this.markerLayerGroup) return;

    this.markerLayerGroup.clearLayers();
    this.markers = [];

    // allLocations now contains exactly the teams for the activeLeague
    this.addTeamMarkers(this.allLocations);
  }

  private addTeamMarkers(locations: (TeamLocation & { dynamicPath?: string })[]): void {
    locations.forEach(team => {
      let logoUrl = team.dynamicPath;
      
      if (!logoUrl) {
        let folderName = 'SUPERLEAGUE';
        if (team.league === 'SUPERLEAGUE 2') folderName = 'SUPERLEAGUE 2';
        if (team.league === 'Γ ΕΘΝΙΚΗ') folderName = 'Γ ΕΘΝΙΚΗ';
        logoUrl = `assets/logos/${folderName}/${team.id}.png`;
      }

      const customIcon = L.divIcon({
        className: 'custom-team-marker',
        html: `
          <div class="marker-container bg-white dark:bg-gray-800 rounded-full shadow-[0_3px_10px_rgb(0,0,0,0.2)] border-2 border-transparent transition-transform hover:scale-[1.3] hover:border-blue-500 hover:z-[9999] cursor-pointer w-full h-full flex items-center justify-center p-1.5 overflow-hidden">
            <img src="${logoUrl}" alt="${team.name}" class="w-full h-full object-contain drop-shadow-sm pointer-events-none" />
          </div>
        `,
        iconSize: [48, 48],
        iconAnchor: [24, 24]
      });

      const marker = L.marker([team.lat, team.lng], { icon: customIcon })
        .addTo(this.markerLayerGroup)
        .on('click', () => {
          this.selectTeam(team, logoUrl!);
        });

      this.markers.push(marker);
    });
  }

  private selectTeam(team: TeamLocation, logoUrl: string): void {
    this.map.setView([team.lat, team.lng], 9, {
      animate: true,
      duration: 0.5
    });
    this.selectedTeam = team;
    this.selectedTeamLogoUrl = logoUrl;
  }

  closeSidebar(): void {
    this.selectedTeam = null;
    this.map.setView([38.3749, 23.8103], 7, {
      animate: true,
      duration: 0.5
    });
  }
}
