import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-logo-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="filters-container">
      <div class="filters-wrapper">
        <!-- Search Box -->
        <div class="search-container">
          <div class="search-wrapper">
            <input
              type="text"
              class="search-input"
              [(ngModel)]="searchTerm"
              (input)="onSearchChange()"
              placeholder="Search teams..."
            />
            <button
              type="button"
              class="clear-button"
              *ngIf="searchTerm"
              (click)="clearSearch()"
            >
              ✖
            </button>
          </div>
        </div>
        
        <!-- League Selector -->
        <div class="league-filter">
          <label>Competition:</label>
          <div class="select-wrapper">
            <select [(ngModel)]="selectedLeague" (change)="onLeagueChange()">
              <option value="">🌍 All Leagues</option>
              <option 
                *ngFor="let league of leagues" 
                [value]="league" 
                [class.selected]="selectedLeague === league">
                {{ getLeagueDisplayName(league) }}
              </option>
            </select>
            <div class="select-arrow">▼</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .filters-container {
      width: 100%;
      max-width: 1000px;
      margin: 0 auto;
      padding: 0;
    }

    .filters-wrapper {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .search-container {
      flex: 1;
      max-width: 180px;
    }

    .search-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .search-input {
      width: 100%;
      padding: 0.75rem 1rem;
      padding-right: 2.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
    }

    .clear-button {
      position: absolute;
      right: 1rem;
      background: none;
      border: none;
      cursor: pointer;
      color: #666;
      font-size: 1.2rem;
    }

    .league-filter {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      width: 180px;
    }

    .select-wrapper {
      position: relative;
    }

    select {
      width: 100%;
      padding: 0.75rem 1rem;
      padding-right: 2.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
      appearance: none;
      background-color: white;
    }

    .select-arrow {
      position: absolute;
      right: 1rem;
      top: 50%;
      transform: translateY(-50%);
      pointer-events: none;
      color: #666;
    }

    @media (min-width: 768px) {
      .filters-wrapper {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        gap: 0;
      }

      .search-container {
        margin: 0;
      }

      .league-filter {
        margin: 0;
      }
    }

    @media (max-width: 768px) {
      .filters-container {
        padding: 0 1rem;
      }

      .search-container,
      .league-filter {
        margin: 0 auto;
      }
    }

    @media (max-width: 1024px) {
      .filters-container {
        max-width: 800px;
      }
    }

    @media (max-width: 840px) {
      .filters-container {
        max-width: 600px;
      }
    }
  `]
})
export class LogoFiltersComponent {
  @Input() leagues: string[] = [];
  @Input() selectedLeague: string = '';
  @Input() searchTerm: string = '';

  @Output() searchChange = new EventEmitter<string>();
  @Output() leagueChange = new EventEmitter<string>();

  onSearchChange() {
    this.searchChange.emit(this.searchTerm);
  }

  onLeagueChange() {
    this.leagueChange.emit(this.selectedLeague);
  }

  clearSearch() {
    this.searchTerm = '';
    this.searchChange.emit('');
  }

  getLeagueDisplayName(league: string): string {
    if (!league) return '🌍 All Leagues';
    return league === 'SUPERLEAGUE' ? '🏆 Superleague' : league;
  }
} 