import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { FileSaveService } from './file-save.service';

export interface TagData {
  availableTags: string[];
  teamTags: { [teamId: string]: string[] };
}

@Injectable({
  providedIn: 'root'
})
export class TagStorageService {
  private readonly STORAGE_KEY = 'greek_football_tags';
  private readonly TEAM_TAGS_FILE = 'assets/data/team-tags.json';
  private tagDataSubject = new BehaviorSubject<TagData>({
    availableTags: [],
    teamTags: {}
  });
  
  // Track pending changes
  private pendingChanges: { [teamId: string]: string[] } = {};
  private hasPendingChanges = false;

  constructor(private http: HttpClient, private fileSaveService: FileSaveService) {
    this.loadFromStorage();
    // Initialize with defaults if no data exists
    if (!localStorage.getItem(this.STORAGE_KEY)) {
      this.resetToDefaults();
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data: TagData = JSON.parse(stored);
        this.tagDataSubject.next(data);
      }
    } catch (error) {
      console.error('Error loading tag data from storage:', error);
    }
  }

  private loadTeamTagsFromFile(): Observable<{ [teamId: string]: string[] }> {
    return this.http.get<{ [teamId: string]: string[] }>(this.TEAM_TAGS_FILE).pipe(
      catchError(error => {
        console.error('Error loading team tags from file:', error);
        return of({});
      })
    );
  }

  private saveTeamTagsToFile(teamTags: { [teamId: string]: string[] }): void {
    this.fileSaveService.saveTeamTags(teamTags).subscribe(
      success => {
        if (success) {
          console.log('Team tags saved to external file successfully');
        } else {
          console.error('Failed to save team tags to external file');
        }
      }
    );
  }

  private saveToStorage(data: TagData): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      this.tagDataSubject.next(data);
    } catch (error) {
      console.error('Error saving tag data to storage:', error);
    }
  }

  getTagData(): Observable<TagData> {
    return this.tagDataSubject.asObservable();
  }

  getCurrentTagData(): TagData {
    return this.tagDataSubject.value;
  }

  // Get current team tags including pending changes
  getTeamTagsWithPendingChanges(teamId: string): string[] {
    const currentData = this.getCurrentTagData();
    const baseTags = currentData.teamTags[teamId] || [];
    
    // If there are pending changes for this team, use them
    if (this.pendingChanges[teamId] !== undefined) {
      return this.pendingChanges[teamId];
    }
    
    return baseTags;
  }

  // Check if there are pending changes
  hasChanges(): boolean {
    return this.hasPendingChanges;
  }

  // Get pending changes count
  getPendingChangesCount(): number {
    return Object.keys(this.pendingChanges).length;
  }

  updateAvailableTags(tags: string[]): void {
    const currentData = this.getCurrentTagData();
    const newData: TagData = {
      ...currentData,
      availableTags: tags
    };
    this.saveToStorage(newData);
  }

  updateTeamTags(teamId: string, tags: string[]): void {
    const currentData = this.getCurrentTagData();
    const newData: TagData = {
      ...currentData,
      teamTags: {
        ...currentData.teamTags,
        [teamId]: tags
      }
    };
    this.saveToStorage(newData);
    // Also save to external file
    this.saveTeamTagsToFile(newData.teamTags);
  }

  addTagToTeam(teamId: string, tag: string): void {
    const currentTeamTags = this.getTeamTagsWithPendingChanges(teamId);
    
    if (!currentTeamTags.includes(tag)) {
      const newTeamTags = [...currentTeamTags, tag];
      this.pendingChanges[teamId] = newTeamTags;
      this.hasPendingChanges = true;
      
      // Update the observable to reflect pending changes
      this.updateObservableWithPendingChanges();
    }
  }

  removeTagFromTeam(teamId: string, tag: string): void {
    const currentTeamTags = this.getTeamTagsWithPendingChanges(teamId);
    const newTeamTags = currentTeamTags.filter(t => t !== tag);
    this.pendingChanges[teamId] = newTeamTags;
    this.hasPendingChanges = true;
    
    // Update the observable to reflect pending changes
    this.updateObservableWithPendingChanges();
  }

  // Save all pending changes
  savePendingChanges(): void {
    if (!this.hasPendingChanges) {
      console.log('No pending changes to save');
      return;
    }

    const currentData = this.getCurrentTagData();
    const newData: TagData = {
      ...currentData,
      teamTags: {
        ...currentData.teamTags,
        ...this.pendingChanges
      }
    };
    
    this.saveToStorage(newData);
    this.saveTeamTagsToFile(newData.teamTags);
    
    // Clear pending changes
    this.pendingChanges = {};
    this.hasPendingChanges = false;
    
    console.log('All pending changes saved successfully');
  }

  // Discard all pending changes
  discardPendingChanges(): void {
    this.pendingChanges = {};
    this.hasPendingChanges = false;
    this.updateObservableWithPendingChanges();
    console.log('All pending changes discarded');
  }

  // Clear all tags from all teams
  clearAllTeamTags(): void {
    const currentData = this.getCurrentTagData();
    const allTeamIds = Object.keys(currentData.teamTags);
    
    // Set all teams to have empty tag arrays
    allTeamIds.forEach(teamId => {
      this.pendingChanges[teamId] = [];
    });
    
    this.hasPendingChanges = true;
    this.updateObservableWithPendingChanges();
    console.log('All team tags cleared (pending save)');
  }

  private updateObservableWithPendingChanges(): void {
    const currentData = this.getCurrentTagData();
    const updatedData: TagData = {
      ...currentData,
      teamTags: {
        ...currentData.teamTags,
        ...this.pendingChanges
      }
    };
    this.tagDataSubject.next(updatedData);
  }

  addNewTag(tag: string): void {
    const currentData = this.getCurrentTagData();
    if (!currentData.availableTags.includes(tag)) {
      const newTags = [...currentData.availableTags, tag];
      this.updateAvailableTags(newTags);
    }
  }

  removeTag(tag: string): void {
    const currentData = this.getCurrentTagData();
    const newAvailableTags = currentData.availableTags.filter(t => t !== tag);
    this.updateAvailableTags(newAvailableTags);

    // Remove tag from all teams (including pending changes)
    const newTeamTags = { ...currentData.teamTags };
    Object.keys(newTeamTags).forEach(teamId => {
      newTeamTags[teamId] = newTeamTags[teamId].filter(t => t !== tag);
    });
    
    // Also remove from pending changes
    Object.keys(this.pendingChanges).forEach(teamId => {
      if (this.pendingChanges[teamId]) {
        this.pendingChanges[teamId] = this.pendingChanges[teamId].filter(t => t !== tag);
      }
    });
    
    const newData: TagData = {
      availableTags: newAvailableTags,
      teamTags: newTeamTags
    };
    this.saveToStorage(newData);
    // Also save to external file
    this.saveTeamTagsToFile(newTeamTags);
  }

  resetToDefaults(): void {
    const defaultData: TagData = {
      availableTags: [
        'Animals', 'Birds', 'Lions', 'Eagles', 'Horses',
        'Colors', 'Red', 'Blue', 'Green', 'Yellow', 'Black', 'White',
        'Symbols', 'Stars', 'Shields', 'Crowns', 'Crosses',
        'Geometric', 'Circles', 'Triangles', 'Squares',
        'Text', 'Greek Letters', 'Modern', 'Classic', 'Minimalist', 'Complex'
      ],
      teamTags: {}
    };
    this.saveToStorage(defaultData);
    // Load team tags from external file
    this.loadTeamTagsFromFile().subscribe(teamTags => {
      const updatedData = { ...defaultData, teamTags };
      this.saveToStorage(updatedData);
    });
  }

  exportData(): string {
    return JSON.stringify(this.getCurrentTagData(), null, 2);
  }

  importData(jsonData: string): boolean {
    try {
      const data: TagData = JSON.parse(jsonData);
      this.saveToStorage(data);
      return true;
    } catch (error) {
      console.error('Error importing tag data:', error);
      return false;
    }
  }

  // Method to download current team tags as a file (for development)
  downloadTeamTagsFile(): void {
    const currentData = this.getCurrentTagData();
    this.fileSaveService.downloadTeamTagsFile(currentData.teamTags);
  }
} 