import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef, Inject, PLATFORM_ID, Injector, effect } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StadiumService } from '../../services/stadium.service';
import { ThemeService } from '../../services/theme.service';
import { Stadium } from '../../models/team';
import * as L from 'leaflet';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-stadium-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-stadium-manager.component.html',
  styleUrls: ['./admin-stadium-manager.component.css']
})
export class AdminStadiumManagerComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('map', { static: false }) mapContainer!: ElementRef;

  stadiums: Stadium[] = [];
  filteredStadiums: Stadium[] = [];
  searchTerm: string = '';
  selectedStadium: Stadium | null = null;
  editingStadium: Stadium | null = null;

  isSaving: boolean = false;
  isSaved: boolean = false;

  private map!: L.Map;
  private isBrowser: boolean;
  private currentMarker: L.Marker | null = null;
  private geoJsonLayer?: L.GeoJSON;

  constructor(
    private stadiumService: StadiumService,
    private themeService: ThemeService,
    private http: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object,
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

  ngOnInit(): void {
    this.loadStadiums();
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      setTimeout(() => this.initMap(), 100);
    }
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  loadStadiums() {
    this.stadiumService.getStadiums().subscribe({
      next: (stadiums) => {
        this.stadiums = stadiums;
        this.filteredStadiums = [...stadiums];
      },
      error: (err) => console.error('Error loading stadiums', err)
    });
  }

  filterStadiums() {
    let result = this.stadiums;

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(stadium =>
        stadium.name?.toLowerCase().includes(term) ||
        stadium.location?.toLowerCase().includes(term)
      );
    }

    this.filteredStadiums = result;
  }

  selectStadium(stadium: Stadium) {
    this.selectedStadium = stadium;
    // deep copy
    this.editingStadium = JSON.parse(JSON.stringify(stadium));

    // Update map
    if (this.map) {
      setTimeout(() => {
        this.map.invalidateSize();
        if (this.editingStadium!.latitude && this.editingStadium!.longitude) {
          const lat = this.editingStadium!.latitude;
          const lng = this.editingStadium!.longitude;
          this.map.setView([lat, lng], 10);
          this.updateMarker(lat, lng);
        } else {
          // Default to center of Greece
          this.map.setView([38.3749, 23.8103], 6);
          if (this.currentMarker) {
            this.map.removeLayer(this.currentMarker);
            this.currentMarker = null;
          }
        }
      }, 100);
    }
  }

  createNewStadium() {
    this.selectedStadium = null;
    this.editingStadium = {
      name: '',
      capacity: 0,
      region: '',
      location: '',
      latitude: 38.3749, // Default center of Greece
      longitude: 23.8103
    };
    this.clearFilters();

    if (this.map) {
      setTimeout(() => {
        this.map.invalidateSize();
        this.map.setView([38.3749, 23.8103], 6);
        if (this.currentMarker) {
          this.map.removeLayer(this.currentMarker);
          this.currentMarker = null;
        }
      }, 100);
    }
  }

  saveStadiumDetails() {
    if (this.editingStadium) {
      this.isSaving = true;
      this.isSaved = false;

      if (this.editingStadium.id) {
        // Update existing stadium
        this.stadiumService.updateStadium(this.editingStadium.id, this.editingStadium).subscribe({
          next: (updatedStadium) => {
            this.handleSaveSuccess(updatedStadium, false);
          },
          error: (err) => this.handleSaveError(err)
        });
      } else {
        // Create new stadium
        this.stadiumService.createStadium(this.editingStadium).subscribe({
          next: (newStadium) => {
            this.handleSaveSuccess(newStadium, true);
          },
          error: (err) => this.handleSaveError(err)
        });
      }
    }
  }

  private handleSaveSuccess(stadium: Stadium, isNew: boolean) {
    this.isSaving = false;
    this.isSaved = true;
    setTimeout(() => this.isSaved = false, 2000);
    
    if (isNew) {
      this.stadiums.push(stadium);
    } else {
      const index = this.stadiums.findIndex(s => s.id === stadium.id);
      if (index !== -1) {
        this.stadiums[index] = stadium;
      }
    }
    
    this.filterStadiums();
    this.selectedStadium = stadium;
    this.editingStadium = JSON.parse(JSON.stringify(stadium));
  }

  private handleSaveError(err: any) {
    this.isSaving = false;
    console.error('Error saving stadium', err);
    alert('Failed to save stadium changes.');
  }

  cancelEdit() {
    if (this.selectedStadium) {
      this.selectStadium(this.selectedStadium);
    }
  }

  private initMap(): void {
    if (!this.mapContainer || !this.mapContainer.nativeElement) return;
    
    this.map = L.map(this.mapContainer.nativeElement, {
      center: [38.3749, 23.8103],
      zoom: 6
    });

    this.setTileLayer(this.themeService.isDarkMode());

    // Load regions for visual reference
    this.http.get('assets/map/greece-regions.geojson').subscribe({
      next: (geoData: any) => {
        this.geoJsonLayer = L.geoJSON(geoData, {
          style: (feature) => this.getRegionStyle(this.themeService.isDarkMode())
        }).addTo(this.map);
      }
    });

    // Handle clicks to set location
    this.map.on('click', (e: L.LeafletMouseEvent) => {
      if (this.editingStadium) {
        this.editingStadium.latitude = e.latlng.lat;
        this.editingStadium.longitude = e.latlng.lng;
        this.updateMarker(e.latlng.lat, e.latlng.lng);
      }
    });
  }

  private updateMarker(lat: number, lng: number) {
    if (this.currentMarker) {
      this.currentMarker.setLatLng([lat, lng]);
    } else {
      const customIcon = L.divIcon({
        className: 'custom-pin',
        html: `<div style="background-color: red; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.5);"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });
      this.currentMarker = L.marker([lat, lng], { icon: customIcon }).addTo(this.map);
    }
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
    L.tileLayer(tileUrl, { subdomains: 'abcd', maxZoom: 20 }).addTo(this.map);
  }

  private getRegionStyle(isDark: boolean): L.PathOptions {
    return {
      fillColor: isDark ? '#1e3a8a' : '#3b82f6',
      weight: 1,
      color: isDark ? '#1e40af' : '#93c5fd',
      fillOpacity: isDark ? 0.2 : 0.1,
      interactive: false
    };
  }

  clearFilters() {
    this.searchTerm = '';
    this.filterStadiums();
  }
  
  trackById(index: number, stadium: Stadium) { 
    return stadium.id; 
  }
}
