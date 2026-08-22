import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { TeamService } from '../../services/team.service';
import { StadiumService } from '../../services/stadium.service';
import { Team, Stadium } from '../../models/team';
import { League } from '../../models/league';

@Component({
  selector: 'app-admin-team-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-team-manager.component.html',
  styleUrls: ['./admin-team-manager.component.css']
})
export class AdminTeamManagerComponent implements OnInit {
  teams: Team[] = [];
  filteredTeams: Team[] = [];
  stadiums: Stadium[] = [];
  selectedTeam: Team | null = null;
  editingTeam: Team | null = null;
  
  searchTerm: string = '';
  selectedLeague: string = '';
  leagues: League[] = [];
  isLeagueDropdownOpen: boolean = false;
  showSavedMessage: boolean = false;
  activeTab: 'general' | 'stadium' | 'colors' | 'achievements' | 'social' = 'general';

  constructor(
    private adminService: AdminService,
    private teamService: TeamService,
    private stadiumService: StadiumService
  ) {}

  ngOnInit() {
    this.loadData();
    this.loadStadiums();
  }

  loadData() {
    this.teamService.getTeamsManifest().subscribe(teams => {
      this.teams = teams;
      this.filteredTeams = teams;
    });

    this.teamService.getLeagues().subscribe(leagues => {
      this.leagues = leagues;
    });
  }

  loadStadiums() {
    this.stadiumService.getStadiums().subscribe({
      next: (stadiums) => this.stadiums = stadiums,
      error: (err) => console.error('Error loading stadiums', err)
    });
  }

  filterTeams() {
    let filtered = this.teams;

    if (this.selectedLeague) {
      filtered = filtered.filter(team => team.league?.id === this.selectedLeague);
    }

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(team =>
        team.name.toLowerCase().includes(term) ||
        (team.league && team.league.name.toLowerCase().includes(term))
      );
    }

    this.filteredTeams = filtered;
  }

  toggleLeagueDropdown() {
    this.isLeagueDropdownOpen = !this.isLeagueDropdownOpen;
  }

  closeLeagueDropdown() {
    this.isLeagueDropdownOpen = false;
  }

  onLeagueSelect(league: string) {
    this.selectedLeague = league;
    this.isLeagueDropdownOpen = false;
    this.filterTeams();
  }

  getLeagueTeamPath(leagueId: string): string {
    const displayName = this.getLeagueDisplayName(leagueId);
    return this.teamService.getLeagueTeamPath(displayName);
  }

  getLeagueDisplayName(leagueId: string): string {
    if (!leagueId) return '🌍 All Leagues';
    return leagueId.replace(/-/g, ' ').toUpperCase();
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.style.display = 'none';
    }
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedLeague = '';
    this.filterTeams();
  }

  selectTeam(team: Team) {
    this.selectedTeam = { ...team };
    // Initialize nested objects if they are undefined
    this.editingTeam = JSON.parse(JSON.stringify(team)); // Deep copy
    if (!this.editingTeam!.stadium) this.editingTeam!.stadium = {};
    if (!this.editingTeam!.colors) this.editingTeam!.colors = {};
    if (!this.editingTeam!.achievements) this.editingTeam!.achievements = {};
    if (!this.editingTeam!.socialMedia) this.editingTeam!.socialMedia = {};
  }

  isSaving: boolean = false;
  isSaved: boolean = false;

  compareStadiums(s1: Stadium, s2: Stadium): boolean {
    return s1 && s2 ? s1.id === s2.id : s1 === s2;
  }

  saveTeamDetails() {
    if (this.editingTeam && this.editingTeam.id) {
      this.isSaving = true;
      this.isSaved = false;
      this.teamService.updateTeam(this.editingTeam.id, this.editingTeam).subscribe({
        next: (updatedTeam) => {
          this.isSaving = false;
          this.isSaved = true;
          // Revert back to normal state after 2 seconds
          setTimeout(() => {
            this.isSaved = false;
          }, 2000);

          // Update the list
          const index = this.teams.findIndex(t => t.id === updatedTeam.id);
          if (index !== -1) {
            // keep the path property from original list since update returns from DB which might not have physical path
            updatedTeam.path = this.teams[index].path;
            this.teams[index] = updatedTeam;
          }
          this.filterTeams();
          this.selectTeam(updatedTeam);
          this.showSavedIndicator();
        },
        error: (err) => {
          this.isSaving = false;
          console.error('Error saving team', err);
          alert('Failed to save team changes.');
        }
      });
    }
  }

  cancelEdit() {
    if (this.selectedTeam) {
      this.selectTeam(this.selectedTeam); // Revert changes
    }
  }

  setTab(tab: 'general' | 'stadium' | 'colors' | 'achievements' | 'social') {
    this.activeTab = tab;
  }

  private showSavedIndicator() {
    this.showSavedMessage = true;
    setTimeout(() => {
      this.showSavedMessage = false;
    }, 2000);
  }

  trackByTeamId(index: number, team: Team): string {
    return team.id;
  }
}
