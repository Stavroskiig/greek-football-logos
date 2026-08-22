import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { TeamService } from '../../services/team.service';
import { Team } from '../../models/team';
import { League } from '../../models/league';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { forkJoin, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-league-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './league-manager.component.html',
  styleUrls: ['./league-manager.component.css']
})
export class LeagueManagerComponent implements OnInit {
  teams: Team[] = [];
  filteredTeams: Team[] = [];
  leagues: League[] = [];
  
  searchTerm: string = '';
  filterLeague: string = '';
  
  selectedTeamIds: Set<string> = new Set<string>();
  targetLeagueId: string = '';
  
  isLoading: boolean = false;
  isUpdating: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';

  constructor(
    private adminService: AdminService,
    private TeamService: TeamService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    if (!this.adminService.isAdmin()) {
      this.router.navigate(['/admin-login']);
      return;
    }
    
    // Get all leagues first
    this.TeamService.getLeagues().subscribe(leagues => {
      this.leagues = leagues;
      // Select the first league by default if available
      if (this.leagues.length > 0 && !this.filterLeague) {
        this.filterLeague = this.leagues[0].id;
      }
      this.loadData();
    });
  }

  loadData(forceRefresh: boolean = false) {
    if (!this.filterLeague) {
      this.teams = [];
      this.filteredTeams = [];
      return;
    }

    this.isLoading = true;
    // Get logos ONLY for the selected league
    this.TeamService.getTeams(this.filterLeague, undefined, 0, 500, forceRefresh).subscribe(response => {
      this.teams = response.content;
      this.filterTeams();
      this.isLoading = false;
    });
  }

  filterTeams() {
    let filtered = this.teams;

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(team =>
        team.name.toLowerCase().includes(term) ||
        (team.league && team.league.name.toLowerCase().includes(term))
      );
    }

    this.filteredTeams = filtered;
  }

  onFilterLeagueChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.filterLeague = target.value;
    this.loadData();
  }

  clearFilters() {
    this.searchTerm = '';
    this.filterTeams();
  }

  toggleSelection(teamId: string) {
    if (this.selectedTeamIds.has(teamId)) {
      this.selectedTeamIds.delete(teamId);
    } else {
      this.selectedTeamIds.add(teamId);
    }
  }

  toggleAll() {
    if (this.selectedTeamIds.size === this.filteredTeams.length) {
      this.selectedTeamIds.clear();
    } else {
      this.filteredTeams.forEach(team => this.selectedTeamIds.add(team.id));
    }
  }

  isAllSelected(): boolean {
    return this.filteredTeams.length > 0 && this.selectedTeamIds.size === this.filteredTeams.length;
  }

  applyLeague() {
    if (this.selectedTeamIds.size === 0) {
      this.showMessage('Please select at least one team.', true);
      return;
    }
    if (!this.targetLeagueId) {
      this.showMessage('Please select a target league.', true);
      return;
    }

    this.isUpdating = true;
    this.successMessage = '';
    this.errorMessage = '';

    const updateRequests: Observable<any>[] = [];
    this.selectedTeamIds.forEach(teamId => {
      const url = `${environment.apiUrl}/teams/${teamId}/league/${this.targetLeagueId}`;
      updateRequests.push(this.http.put(url, {}).pipe(
        catchError(error => {
          console.error(`Failed to update team ${teamId}`, error);
          throw error;
        })
      ));
    });

    forkJoin(updateRequests).subscribe({
      next: () => {
        this.showMessage(`Successfully updated ${this.selectedTeamIds.size} team(s)!`, false);
        this.selectedTeamIds.clear();
        this.loadData(true); // Reload to get updated leagues and bust cache
        this.isUpdating = false;
      },
      error: () => {
        this.showMessage('An error occurred during update. Some teams may not have been updated.', true);
        this.isUpdating = false;
      }
    });
  }

  private showMessage(msg: string, isError: boolean) {
    if (isError) {
      this.errorMessage = msg;
      setTimeout(() => this.errorMessage = '', 4000);
    } else {
      this.successMessage = msg;
      setTimeout(() => this.successMessage = '', 4000);
    }
  }

  trackByTeamId(index: number, team: Team): string {
    return team.id;
  }
}
