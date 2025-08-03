import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TagService } from '../../services/tag.service';
import { TagStorageService } from '../../services/tag-storage.service';
import { LocalFileEditorService } from '../../services/local-file-editor.service';
import { AdminService } from '../../services/admin.service';
import { LogoService } from '../../services/logo.service';
import { TeamLogo } from '../../models/team-logo';

@Component({
  selector: 'app-tag-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
  showSavedMessage: boolean = false;

  constructor(
    private tagService: TagService,
    private tagStorage: TagStorageService,
    private localFileEditor: LocalFileEditorService,
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
    if (!this.searchTerm.trim()) {
      this.filteredTeams = this.teams;
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredTeams = this.teams.filter(team => 
        team.name.toLowerCase().includes(term) ||
        (team.league && team.league.toLowerCase().includes(term))
      );
    }
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

  resetToDefaults() {
    if (confirm('Are you sure you want to reset all tags to defaults? This will overwrite all current data.')) {
      this.tagStorage.resetToDefaults();
    }
  }

  exportData() {
    const data = this.tagStorage.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'greek-football-tags.json';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  importData(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const success = this.tagStorage.importData(e.target.result);
        if (success) {
          alert('Tag data imported successfully!');
        } else {
          alert('Error importing tag data. Please check the file format.');
        }
      };
      reader.readAsText(file);
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

  // Local File Editor Methods
  generateLocalFile() {
    const fileData = this.localFileEditor.generateLocalFileContent();
    this.showFileContent(fileData);
  }

  generateBackupFile() {
    const fileData = this.localFileEditor.generateBackupContent();
    this.showFileContent(fileData);
  }

  generateSimpleFile() {
    const fileData = this.localFileEditor.generateSimpleFileContent();
    this.showFileContent(fileData);
  }

  private showFileContent(fileData: { filename: string; content: string }) {
    const instructions = this.localFileEditor.generateInstructions(fileData.filename);
    const gitCommands = this.localFileEditor.generateGitCommands(fileData.filename);
    
    const message = `${instructions}\n\n📄 Filename: ${fileData.filename}\n\n🔧 Git Commands:\n${gitCommands}\n\n📄 File Content:\n${fileData.content}`;
    
    alert(message);
  }

  async loadFromLocalFile(event: any) {
    const file = event.target.files[0];
    if (file) {
      const result = await this.localFileEditor.loadFromLocalFile(file);
      if (result.success) {
        alert(result.message);
        this.showSavedIndicator();
      } else {
        alert('Error: ' + result.message);
      }
    }
  }
} 