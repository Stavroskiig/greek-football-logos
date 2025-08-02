import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LogoService } from '../../services/logo.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-league-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './league-selector.component.html'
})
export class LeagueSelectorComponent implements OnInit {
  @Input() selectedLeague: string = '';
  @Output() leagueChange = new EventEmitter<string>();
  
  leagues$: Observable<string[]>;
  isOpen = false;

  constructor(private logoService: LogoService) {
    this.leagues$ = this.logoService.getLeagues();
  }

  ngOnInit() {}

  onLeagueSelect(league: string) {
    this.selectedLeague = league;
    this.leagueChange.emit(league);
    this.isOpen = false;
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  closeDropdown() {
    this.isOpen = false;
  }

  getLeagueLogoPath(leagueName: string): string {
    const path = this.logoService.getLeagueLogoPath(leagueName);
    console.log(`League: ${leagueName}, Logo Path: ${path}`);
    return path;
  }

  getDisplayName(league: string): string {
    if (!league) return '🌍 All Leagues';
    return league;
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.style.display = 'none';
    }
  }
} 