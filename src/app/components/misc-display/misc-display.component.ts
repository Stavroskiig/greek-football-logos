import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LogoService } from '../../services/logo.service';
import { TagService } from '../../services/tag.service';
import { Observable, combineLatest, map, of } from 'rxjs';
import { LogoItemComponent } from '../logo-item/logo-item.component';
import { TagSelectorComponent } from '../tag-selector/tag-selector.component';
import { TeamLogo } from '../../models/team-logo';

@Component({
  selector: 'app-misc-display',
  standalone: true,
  imports: [CommonModule, FormsModule, LogoItemComponent, TagSelectorComponent],
  templateUrl: './misc-display.component.html'
})
export class MiscDisplayComponent implements OnInit {
  searchTerm: string = '';
  selectedTags: string[] = [];
  logos$: Observable<TeamLogo[]>;
  allLogos: TeamLogo[] = [];

  constructor(
    private logoService: LogoService,
    private tagService: TagService
  ) {
    // Start with empty results by default
    this.logos$ = of([]);
  }

  ngOnInit() {
    this.logoService.getLogosManifest().subscribe(logos => {
      this.allLogos = logos;
      this.applyFilters();
    });
  }

  applyFilters() {
    // Only show results if tags are selected or search term is entered
    if (this.selectedTags.length === 0 && !this.searchTerm.trim()) {
      this.logos$ = of([]);
      return;
    }

    this.logos$ = this.logoService.getLogosManifest().pipe(
      map(logos => {
        let filteredLogos = [...logos];

        // Filter by search term
        if (this.searchTerm.trim()) {
          filteredLogos = filteredLogos.filter(logo => 
            this.normalizeString(logo.name).includes(this.normalizeString(this.searchTerm))
          );
        }

        // Filter by selected tags
        if (this.selectedTags.length > 0) {
          filteredLogos = this.tagService.getTeamsByMultipleTags(this.selectedTags, filteredLogos);
        }

        return filteredLogos;
      })
    );
  }

  onTagsChange(tags: string[]) {
    this.selectedTags = tags;
    this.applyFilters();
  }

  clearSearch() {
    this.searchTerm = '';
    this.applyFilters();
  }

  clearAllFilters() {
    this.searchTerm = '';
    this.selectedTags = [];
    this.applyFilters();
  }

  private normalizeString(str: string): string {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9α-ωά-ώ\s]/g, '');
  }
} 