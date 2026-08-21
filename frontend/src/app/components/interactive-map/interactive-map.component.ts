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

    // Setup theme listener using Angular signals effect
    if (this.isBrowser) {
      effect(() => {
        // Track the signal
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
    // Define bounds for Greece (Southwest to Northeast)
    const greeceBounds = L.latLngBounds(
      L.latLng(34.0, 19.0), // Southwest corner
      L.latLng(42.0, 30.0)  // Northeast corner
    );

    // Center map on Greece
    this.map = L.map(this.mapContainer.nativeElement, {
      center: [38.3749, 23.8103],
      zoom: 7, // Initial zoom
      minZoom: 7, // Prevent zooming out further than Greece
      maxBounds: greeceBounds, // Restrict panning to these bounds
      maxBoundsViscosity: 1.0, // Prevent dragging outside bounds
      zoomControl: false, // will add custom positioned one later
    });

    this.markerLayerGroup = L.layerGroup().addTo(this.map); // Add layer group for markers

    L.control.zoom({ position: 'bottomright' }).addTo(this.map);

    this.setTileLayer(this.themeService.isDarkMode());

    // Load GeoJSON Regions
    this.http.get('assets/map/greece-regions.geojson').subscribe({
      next: (geoData: any) => {
        this.geoJsonLayer = L.geoJSON(geoData, {
          style: (feature) => this.getRegionStyle(this.themeService.isDarkMode())
        }).addTo(this.map);
      },
      error: (err) => console.error('Error loading Greece GeoJSON', err)
    });

    // Load Super League & SL2 Locations and merge with dynamic DB leagues
    this.http.get<TeamLocation[]>('assets/data/team-locations.json').subscribe({
      next: (locations) => {
        this.logoService.getAllLogos(0, 5000).subscribe(dbLogos => {
          // Create a map of team names to their dynamic league IDs/names and paths
          const dbDataMap = new Map<string, { league: string, path: string }>();
          dbLogos.content.forEach(logo => {
            // Map by the exact logo name (which matches the JSON 'id' field for most teams)
            dbDataMap.set(logo.name, { league: logo.league?.name || '', path: logo.path });
          });

          // Merge DB leagues and paths into locations
          this.allLocations = locations.map(loc => {
            const dbData = dbDataMap.get(loc.id) || dbDataMap.get(loc.name);
            return {
              ...loc,
              // Override the static league with the DB league if it exists
              league: dbData ? dbData.league : loc.league,
              // Add dynamic path from DB (which uses manifest)
              dynamicPath: dbData ? dbData.path : null
            } as TeamLocation & { dynamicPath?: string };
          });
          
          this.filterMarkers();
        });
      },
      error: (err) => console.error('Error loading team locations', err)
    });
  }

  private setTileLayer(isDark: boolean): void {
    if (!this.map) return;

    // Remove existing tile layers
    this.map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        this.map.removeLayer(layer);
      }
    });

    // CartoDB Positron / Dark Matter
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
      fillColor: isDark ? '#1e3a8a' : '#3b82f6', // blue-900 / blue-500
      weight: 1.5, // Slightly thinner borders
      opacity: 0.8,
      color: isDark ? '#1e40af' : '#93c5fd', // blue-800 / blue-300
      fillOpacity: isDark ? 0.3 : 0.15, // More transparent
      interactive: false
    };
  }

  setLeague(league: string): void {
    this.activeLeague = league;
    this.closeSidebar(); // Reset selection when swapping leagues
    this.filterMarkers();
  }

  private filterMarkers(): void {
    if (!this.map || !this.markerLayerGroup) return;

    // Clear existing markers
    this.markerLayerGroup.clearLayers();
    this.markers = []; // Optional if you don't need the array, but good for tracking

    // Filter locations by active league
    const filteredTeams = this.allLocations.filter(team => team.league === this.activeLeague);
    this.addTeamMarkers(filteredTeams);
  }

  private addTeamMarkers(locations: (TeamLocation & { dynamicPath?: string })[]): void {
    locations.forEach(team => {
      // Use dynamicPath if available, otherwise fallback to static hardcoded path
      let logoUrl = team.dynamicPath;
      
      if (!logoUrl) {
        let folderName = 'SUPERLEAGUE';
        if (team.league === 'SUPERLEAGUE 2') folderName = 'SUPERLEAGUE 2';
        if (team.league === 'Γ ΕΘΝΙΚΗ') folderName = 'Γ ΕΘΝΙΚΗ';
        logoUrl = `assets/logos/${folderName}/${team.id}.png`;
      }

      // Custom HTML Icon for the Logo marker
      const customIcon = L.divIcon({
        className: 'custom-team-marker',
        html: `
          <div class="marker-container bg-white dark:bg-gray-800 rounded-full shadow-[0_3px_10px_rgb(0,0,0,0.2)] border-2 border-transparent transition-transform hover:scale-[1.3] hover:border-blue-500 hover:z-[9999] cursor-pointer w-full h-full flex items-center justify-center p-1.5 overflow-hidden">
            <img src="${logoUrl}" alt="${team.name}" class="w-full h-full object-contain drop-shadow-sm pointer-events-none" />
          </div>
        `,
        iconSize: [48, 48], // Enforce fixed explicit size provided by Leaflet wrapper
        iconAnchor: [24, 24] // center
      });

      const marker = L.marker([team.lat, team.lng], { icon: customIcon })
        .addTo(this.markerLayerGroup) // Note: Add to layer group instead of map directly
        .on('click', () => {
          this.selectTeam(team, logoUrl);
        });

      this.markers.push(marker);
    });
  }

  private selectTeam(team: TeamLocation, logoUrl: string): void {
    // Pan to feature and open sidebar without zooming all the way out
    this.map.setView([team.lat, team.lng], 9, {
      animate: true,
      duration: 0.5 // slightly faster animation
    });
    this.selectedTeam = team;
    this.selectedTeamLogoUrl = logoUrl;
  }

  closeSidebar(): void {
    this.selectedTeam = null;
    this.map.setView([38.3749, 23.8103], 7, { // Note: changed zoom back to 7 from 6 to match the init zoom and prevent sudden jumps
      animate: true,
      duration: 0.5
    });
  }
}
