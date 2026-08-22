import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TeamService } from '../../services/team.service';
import { Observable, map } from 'rxjs';
import { League } from '../../models/league';

@Component({
  selector: 'app-league-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './league-selector.component.html'
})
export class LeagueSelectorComponent implements OnInit {
  @Input() selectedLeague: string = '';
  @Output() leagueChange = new EventEmitter<string>();

  leagues$: Observable<League[]>;
  isOpen = false;

  constructor(private TeamService: TeamService) {
    this.leagues$ = this.TeamService.getLeagues();
  }

  ngOnInit() { }

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

  getLeagueTeamPath(leagueName: string): string {
    return this.TeamService.getLeagueTeamPath(leagueName);
  }

  getDisplayName(leagueId: string): string {
    if (!leagueId) return '🌍 All Leagues';
    
    // Attempt to format ID reasonably if we don't have the object mapping here
    return leagueId.replace(/-/g, ' ').toUpperCase();
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.style.display = 'none';
    }
  }
} 
