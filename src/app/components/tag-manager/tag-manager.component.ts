import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TagService } from '../../services/tag.service';
import { TagStorageService } from '../../services/tag-storage.service';
import { AdminService } from '../../services/admin.service';
import { LogoService } from '../../services/logo.service';
import { TeamLogo } from '../../models/team-logo';
import { FileManagerComponent } from '../file-manager/file-manager.component';

@Component({
  selector: 'app-tag-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, FileManagerComponent],
  templateUrl: './tag-manager.component.html'
})
export class TagManagerComponent implements OnInit {
  teams: TeamLogo[] = [];
  filteredTeams: TeamLogo[] = [];
  availableTags: string[] = [];
  newTag: string = '';
  selectedTeam: TeamLogo | null = null;
  teamTags: { [teamId: string]: string[] } = {};
  searchTerm: string = '';
  selectedLeague: string = '';
  leagues: string[] = [];
  isLeagueDropdownOpen: boolean = false;
  showSavedMessage: boolean = false;

  constructor(
    private tagService: TagService,
    private tagStorage: TagStorageService,
    private adminService: AdminService,
    private logoService: LogoService,
    private router: Router
  ) {}

  ngOnInit() {
    // Check if user is admin
    if (!this.adminService.isAdmin()) {
      this.router.navigate(['/admin-login']);
      return;
    }
    this.loadData();
  }

  loadData() {
    this.logoService.getLogosManifest().subscribe(teams => {
      this.teams = teams;
      this.filteredTeams = teams;
      this.teamTags = this.tagService.getAllTeamTags();
    });

    this.logoService.getLeagues().subscribe(leagues => {
      this.leagues = leagues;
    });

    this.tagService.getAvailableTags().subscribe(tags => {
      this.availableTags = tags;
    });

    // Subscribe to tag data changes
    this.tagStorage.getTagData().subscribe(data => {
      this.availableTags = data.availableTags;
      this.teamTags = data.teamTags;
    });
  }

  filterTeams() {
    let filtered = this.teams;

    // Filter by league
    if (this.selectedLeague) {
      filtered = filtered.filter(team => 
        team.league === this.selectedLeague
      );
    }

    // Filter by search term
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(team => 
        team.name.toLowerCase().includes(term) ||
        (team.league && team.league.toLowerCase().includes(term))
      );
    }

    this.filteredTeams = filtered;
  }

  onLeagueChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.selectedLeague = target.value;
    this.filterTeams();
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

  getLeagueLogoPath(leagueName: string): string {
    return this.logoService.getLeagueLogoPath(leagueName);
  }

  getLeagueDisplayName(league: string): string {
    if (!league) return '🌍 All Leagues';
    return league;
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

  selectTeam(team: TeamLogo) {
    this.selectedTeam = { ...team }; // Create a copy to avoid reference issues
  }

  addTagToTeam(teamId: string, tag: string) {
    this.tagService.addTagToTeam(teamId, tag);
    this.showSavedIndicator();
  }

  removeTagFromTeam(teamId: string, tag: string) {
    this.tagService.removeTagFromTeam(teamId, tag);
    this.showSavedIndicator();
  }

  addNewTag() {
    if (this.newTag.trim() && !this.availableTags.includes(this.newTag.trim())) {
      this.tagService.addNewTag(this.newTag.trim());
      this.newTag = '';
      this.showSavedIndicator();
    }
  }

  private showSavedIndicator() {
    this.showSavedMessage = true;
    setTimeout(() => {
      this.showSavedMessage = false;
    }, 2000);
  }

  removeTag(tag: string) {
    if (confirm(`Are you sure you want to remove the tag "${tag}"? This will remove it from all teams.`)) {
      this.tagStorage.removeTag(tag);
    }
  }

  logout() {
    this.adminService.logout();
    this.router.navigate(['/']);
  }

  getTeamTags(teamId: string): string[] {
    return this.teamTags[teamId] || [];
  }

  isTagAssignedToTeam(teamId: string, tag: string): boolean {
    return this.getTeamTags(teamId).includes(tag);
  }

  trackByTeamId(index: number, team: TeamLogo): string {
    return team.id;
  }


} 