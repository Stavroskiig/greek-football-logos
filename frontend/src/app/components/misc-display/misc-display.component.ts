import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TeamService } from '../../services/team.service';
import { TagService } from '../../services/tag.service';
import { StructuredDataService } from '../../services/structured-data.service';
import { Observable, Subscription, map, of, shareReplay } from 'rxjs';
import { LogoItemComponent } from '../logo-item/logo-item.component';
import { TagSelectorComponent } from '../tag-selector/tag-selector.component';
import { Logo } from '../../models/logo';
import { Team } from '../../models/team';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-misc-display',
  standalone: true,
  imports: [CommonModule, FormsModule, LogoItemComponent, TagSelectorComponent, TranslatePipe],
  templateUrl: './misc-display.component.html'
})
export class MiscDisplayComponent implements OnInit {
  searchTerm: string = '';
  selectedTags: string[] = [];
  logos$!: Observable<Team[]>;

  constructor(
    private TeamService: TeamService,
    private tagService: TagService,
    private structuredDataService: StructuredDataService
  ) {
    // Start with empty results by default
    this.logos$ = of([]);
  }

  ngOnInit() {
    this.applyFilters();
  }

  private injectStructuredData(logos: Team[]): void {
    // Inject search page and collection structured data
    this.structuredDataService.injectMultipleStructuredData([
      this.structuredDataService.generateSearchPageStructuredData(),
      this.structuredDataService.generateCollectionStructuredData(logos)
    ]);
  }

  applyFilters() {
    // Only show results if tags are selected or search term is entered
    if (this.selectedTags.length === 0 && !this.searchTerm.trim()) {
      this.logos$ = of([]);
      return;
    }

    if (this.selectedTags.length > 0) {
      // Find matching team IDs locally first
      const teamIds = this.tagService.getTeamIdsByMultipleTags(this.selectedTags);

      if (teamIds.length === 0) {
        this.logos$ = of([]);
        return;
      }

      this.logos$ = this.TeamService.getTeamsByIds(teamIds, this.searchTerm.trim(), 0, 100).pipe(
        map(page => {
          this.injectStructuredData(page.content);
          return page.content;
        }),
        shareReplay(1)
      );
    } else {
      // Only search term
      this.logos$ = this.TeamService.getTeams(undefined, this.searchTerm.trim(), 0, 100).pipe(
        map(page => {
          this.injectStructuredData(page.content);
          return page.content;
        }),
        shareReplay(1)
      );
    }
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
