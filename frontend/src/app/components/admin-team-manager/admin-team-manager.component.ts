import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { TeamService } from '../../services/team.service';
import { StadiumService } from '../../services/stadium.service';
import { LogoUploadService } from '../../services/logo-upload.service';
import { Team, Stadium } from '../../models/team';
import { League } from '../../models/league';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-admin-team-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-team-manager.component.html',
  styleUrls: ['./admin-team-manager.component.css']
})
export class AdminTeamManagerComponent implements OnInit {
  teams: Team[] = [];
  stadiums: Stadium[] = [];
  selectedTeam: Team | null = null;
  editingTeam: Team | null = null;
  
  searchTerm: string = '';
  selectedLeague: string = '';
  leagues: League[] = [];
  isLeagueDropdownOpen: boolean = false;
  showSavedMessage: boolean = false;
  activeTab: 'general' | 'stadium' | 'colors' | 'achievements' | 'social' | 'history' = 'general';

  currentPage: number = 0;
  pageSize: number = 50;
  totalPages: number = 0;
  totalElements: number = 0;
  private searchSubject = new Subject<string>();

  // Historical Logos form state
  newHistoricalLogo: any = {
    path: '',
    startYear: null,
    endYear: null
  };
  editingHistoricalLogoId: string | null = null;
  isUploadingHistoricalLogo: boolean = false;

  constructor(
    private adminService: AdminService,
    private teamService: TeamService,
    private stadiumService: StadiumService,
    private logoUploadService: LogoUploadService
  ) {}

  ngOnInit() {
    this.loadData();
    this.loadStadiums();

    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe((searchTerm: string) => {
      this.searchTerm = searchTerm;
      this.currentPage = 0;
      this.loadTeams();
    });
  }

  loadData() {
    this.loadTeams();
    this.teamService.getLeagues().subscribe((leagues: League[]) => {
      this.leagues = leagues;
    });
  }

  loadTeams() {
    this.teamService.getTeams(this.selectedLeague, this.searchTerm, this.currentPage, this.pageSize).subscribe((page: any) => {
      this.teams = page.content;
      this.totalPages = page.totalPages;
      this.totalElements = page.totalElements;
    });
  }

  loadStadiums() {
    this.stadiumService.getStadiums().subscribe({
      next: (stadiums: Stadium[]) => this.stadiums = stadiums,
      error: (err: any) => console.error('Error loading stadiums', err)
    });
  }

  onSearchInput(event: any) {
    this.searchSubject.next(event.target.value);
  }

  filterTeams() {
    this.currentPage = 0;
    this.loadTeams();
  }

  changePage(delta: number) {
    const newPage = this.currentPage + delta;
    if (newPage >= 0 && newPage < this.totalPages) {
      this.currentPage = newPage;
      this.loadTeams();
    }
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
        next: (updatedTeam: Team) => {
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
          this.selectTeam(updatedTeam);
          this.showSavedIndicator();
        },
        error: (err: any) => {
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

  setTab(tab: 'general' | 'stadium' | 'colors' | 'achievements' | 'social' | 'history') {
    this.activeTab = tab;
  }

  editHistoricalLogo(logo: any) {
    this.editingHistoricalLogoId = logo.id;
    this.newHistoricalLogo = {
      path: logo.path,
      startYear: logo.startYear,
      endYear: logo.endYear
    };
  }

  cancelEditHistoricalLogo() {
    this.editingHistoricalLogoId = null;
    this.newHistoricalLogo = { path: '', startYear: null, endYear: null };
  }

  onPathChange(newPath: string) {
    if (!newPath) return;
    
    // Try to extract start and end years from filenames ending with -YYYY_YYYY (e.g. team-1924_1929.png)
    const filenameWithExt = newPath.split('/').pop() || '';
    const filename = filenameWithExt.split('.')[0];
    
    const match = filename.match(/-(\d{4})_(\d{4})$/);
    if (match) {
      // Only auto-fill if they are currently empty, to not override manual edits
      if (this.newHistoricalLogo.startYear === null || this.newHistoricalLogo.startYear === undefined) {
        this.newHistoricalLogo.startYear = parseInt(match[1], 10);
      }
      if (this.newHistoricalLogo.endYear === null || this.newHistoricalLogo.endYear === undefined) {
        this.newHistoricalLogo.endYear = parseInt(match[2], 10);
      }
    }
  }

  saveHistoricalLogo() {
    if (this.editingTeam && this.editingTeam.id && this.newHistoricalLogo.path) {
      this.isSaving = true;
      
      const request$ = this.editingHistoricalLogoId
        ? this.teamService.updateHistoricalLogo(this.editingTeam.id, this.editingHistoricalLogoId, this.newHistoricalLogo)
        : this.teamService.addHistoricalLogo(this.editingTeam.id, this.newHistoricalLogo);

      request$.subscribe({
        next: (updatedTeam: Team) => {
          this.isSaving = false;
          if (updatedTeam.historicalLogos) {
            updatedTeam.historicalLogos.sort((a: any, b: any) => (a.startYear || 0) - (b.startYear || 0));
          }
          const index = this.teams.findIndex(t => t.id === updatedTeam.id);
          if (index !== -1) {
            updatedTeam.path = this.teams[index].path;
            this.teams[index] = updatedTeam;
          }
          this.selectTeam(updatedTeam);
          this.showSavedIndicator();
          // Reset form
          this.cancelEditHistoricalLogo();
        },
        error: (err: any) => {
          this.isSaving = false;
          console.error('Error saving historical logo', err);
          alert('Failed to save historical logo.');
        }
      });
    }
  }

  deleteHistoricalLogo(logoId: string) {
    if (this.editingTeam && this.editingTeam.id) {
      if (confirm('Are you sure you want to delete this historical logo?')) {
        this.isSaving = true;
        this.teamService.deleteHistoricalLogo(this.editingTeam.id, logoId).subscribe({
          next: (updatedTeam: Team) => {
            this.isSaving = false;
            if (updatedTeam.historicalLogos) {
              updatedTeam.historicalLogos.sort((a: any, b: any) => (a.startYear || 0) - (b.startYear || 0));
            }
            const index = this.teams.findIndex(t => t.id === updatedTeam.id);
            if (index !== -1) {
              updatedTeam.path = this.teams[index].path;
              this.teams[index] = updatedTeam;
            }
            this.selectTeam(updatedTeam);
            this.showSavedIndicator();
          },
          error: (err: any) => {
            this.isSaving = false;
            console.error('Error deleting historical logo', err);
            alert('Failed to delete historical logo.');
          }
        });
      }
    }
  }

  onUploadHistoricalLogo(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0 || !this.editingTeam) return;

    const file = input.files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('league', 'history');
    formData.append('teamId', this.editingTeam.id);
    formData.append('isHistorical', 'true');
    if (this.newHistoricalLogo.startYear) formData.append('startYear', this.newHistoricalLogo.startYear.toString());
    if (this.newHistoricalLogo.endYear) formData.append('endYear', this.newHistoricalLogo.endYear.toString());

    this.isUploadingHistoricalLogo = true;
    this.logoUploadService.uploadLogo(formData).subscribe({
      next: (res: any) => {
        this.isUploadingHistoricalLogo = false;
        input.value = '';
        if (res.success && res.path) {
          this.newHistoricalLogo.path = res.path;
          this.showSavedIndicator();
          // Reload updated team
          if (this.editingTeam) {
            this.teamService.getTeams(undefined, this.editingTeam.name, 0, 1).subscribe((page: any) => {
              if (page.content && page.content.length > 0) {
                const refreshed = page.content.find((t: Team) => t.id === this.editingTeam!.id) || page.content[0];
                this.selectTeam(refreshed);
              }
            });
          }
        }
      },
      error: (err: any) => {
        this.isUploadingHistoricalLogo = false;
        input.value = '';
        console.error('Historical logo upload error', err);
        alert('Upload failed: ' + (err.error?.message || err.message));
      }
    });
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
