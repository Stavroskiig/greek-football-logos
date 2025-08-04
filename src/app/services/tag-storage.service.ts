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
  private readonly AVAILABLE_TAGS_FILE = 'assets/data/available-tags.json';
  private tagDataSubject = new BehaviorSubject<TagData>({
    availableTags: [],
    teamTags: {}
  });
  
  // Track pending changes
  private pendingChanges: { [teamId: string]: string[] } = {};
  private hasPendingChanges = false;
  
  // Track pending available tag changes
  private pendingAvailableTags: string[] = [];
  private hasPendingAvailableTagChanges = false;

  constructor(private http: HttpClient, private fileSaveService: FileSaveService) {
    this.loadFromStorage();
    // Initialize with defaults if no data exists
    if (!localStorage.getItem(this.STORAGE_KEY)) {
      this.resetToDefaults();
    }
    
    // Always load the latest data from external files to ensure consistency
    this.loadExternalData();
  }

  private loadExternalData(): void {
    // Load both team tags and available tags from external files
    this.loadTeamTagsFromFile().subscribe(teamTags => {
      this.loadAvailableTagsFromFile().subscribe(availableTags => {
        const currentData = this.getCurrentTagData();
        const updatedData: TagData = {
          availableTags: availableTags.length > 0 ? availableTags : currentData.availableTags,
          teamTags: Object.keys(teamTags).length > 0 ? teamTags : currentData.teamTags
        };
        
        // Only update if we have external data
        if (availableTags.length > 0 || Object.keys(teamTags).length > 0) {
          this.saveToStorage(updatedData);
          console.log('✅ Loaded external tag data:', {
            availableTags: availableTags.length,
            teamTags: Object.keys(teamTags).length
          });
        }
      });
    });
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

  private loadAvailableTagsFromFile(): Observable<string[]> {
    return this.http.get<string[]>(this.AVAILABLE_TAGS_FILE).pipe(
      catchError(error => {
        console.error('Error loading available tags from file:', error);
        return of([]);
      })
    );
  }

  private saveTeamTagsToFile(teamTags: { [teamId: string]: string[] }): void {
    this.fileSaveService.saveTeamTags(teamTags).subscribe(
      success => {
        if (success) {
          console.log('✅ Team tags saved to external file successfully');
        } else {
          console.warn('⚠️ Failed to save team tags to external file (server may be offline)');
        }
      },
      error => {
        console.warn('⚠️ Server offline - team tags saved to localStorage only:', error);
      }
    );
  }

  private saveAvailableTagsToFile(availableTags: string[]): void {
    this.fileSaveService.saveAvailableTags(availableTags).subscribe(
      success => {
        if (success) {
          console.log('✅ Available tags saved to external file successfully');
        } else {
          console.warn('⚠️ Failed to save available tags to external file (server may be offline)');
        }
      },
      error => {
        console.warn('⚠️ Server offline - available tags saved to localStorage only:', error);
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
    const hasChanges = this.hasPendingChanges || this.hasPendingAvailableTagChanges;
    console.log('🔍 Checking for changes:', hasChanges, 'Pending team changes:', Object.keys(this.pendingChanges), 'Pending available tag changes:', this.hasPendingAvailableTagChanges);
    return hasChanges;
  }

  // Get pending changes count
  getPendingChangesCount(): number {
    const teamChangesCount = Object.keys(this.pendingChanges).length;
    const availableTagChangesCount = this.hasPendingAvailableTagChanges ? 1 : 0;
    return teamChangesCount + availableTagChangesCount;
  }

  updateAvailableTags(tags: string[]): void {
    console.log('🔄 Updating available tags:', tags);
    const currentData = this.getCurrentTagData();
    const newData: TagData = {
      ...currentData,
      availableTags: tags
    };
    this.saveToStorage(newData);
    // Also save to external file
    this.saveAvailableTagsToFile(tags);
    console.log('✅ Available tags updated and saved to external file');
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
    if (!this.hasPendingChanges && !this.hasPendingAvailableTagChanges) {
      console.log('No pending changes to save');
      return;
    }

    const currentData = this.getCurrentTagData();
    let newData: TagData = {
      ...currentData,
      teamTags: {
        ...currentData.teamTags,
        ...this.pendingChanges
      }
    };
    
    // Handle available tag changes
    if (this.hasPendingAvailableTagChanges) {
      newData = {
        ...newData,
        availableTags: this.pendingAvailableTags
      };
      this.saveAvailableTagsToFile(this.pendingAvailableTags);
    }
    
    this.saveToStorage(newData);
    this.saveTeamTagsToFile(newData.teamTags);
    
    // Clear pending changes
    this.pendingChanges = {};
    this.hasPendingChanges = false;
    this.pendingAvailableTags = [];
    this.hasPendingAvailableTagChanges = false;
    
    console.log('All pending changes saved successfully');
  }

  // Discard all pending changes
  discardPendingChanges(): void {
    this.pendingChanges = {};
    this.hasPendingChanges = false;
    this.pendingAvailableTags = [];
    this.hasPendingAvailableTagChanges = false;
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
    let updatedData: TagData = {
      ...currentData,
      teamTags: {
        ...currentData.teamTags,
        ...this.pendingChanges
      }
    };
    
    // Include pending available tag changes
    if (this.hasPendingAvailableTagChanges) {
      updatedData = {
        ...updatedData,
        availableTags: this.pendingAvailableTags
      };
    }
    
    this.tagDataSubject.next(updatedData);
  }

  addNewTag(tag: string): void {
    console.log('➕ Adding new tag:', tag);
    const currentData = this.getCurrentTagData();
    if (!currentData.availableTags.includes(tag)) {
      // Add to pending available tags instead of saving immediately
      this.pendingAvailableTags = [...currentData.availableTags, tag];
      this.hasPendingAvailableTagChanges = true;
      this.updateObservableWithPendingChanges();
      console.log('✅ New tag added to pending changes');
    } else {
      console.log('⚠️ Tag already exists:', tag);
    }
  }

  removeTag(tag: string): void {
    const currentData = this.getCurrentTagData();
    const newAvailableTags = currentData.availableTags.filter(t => t !== tag);
    
    // Add to pending available tags instead of saving immediately
    this.pendingAvailableTags = newAvailableTags;
    this.hasPendingAvailableTagChanges = true;

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
    
    // Update the observable to reflect pending changes
    this.updateObservableWithPendingChanges();
  }

  resetToDefaults(): void {
    // Load both team tags and available tags from external files
    this.loadTeamTagsFromFile().subscribe(teamTags => {
      this.loadAvailableTagsFromFile().subscribe(availableTags => {
        const defaultData: TagData = {
          availableTags: availableTags.length > 0 ? availableTags : [
            'Animals', 'Birds', 'Lions', 'Eagles', 'Horses',
            'Colors', 'Red', 'Blue', 'Green', 'Yellow', 'Black', 'White',
            'Symbols', 'Stars', 'Shields', 'Crowns', 'Crosses',
            'Geometric', 'Circles', 'Triangles', 'Squares',
            'Text', 'Greek Letters', 'Modern', 'Classic', 'Minimalist', 'Complex'
          ],
          teamTags: teamTags
        };
        this.saveToStorage(defaultData);
      });
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

  // Check if server is online
  isServerOnline(): Observable<boolean> {
    return this.http.get<boolean>('/api/health').pipe(
      catchError(() => of(false))
    );
  }

  // Get server status message
  getServerStatusMessage(): string {
    return 'Server is offline - changes will be saved to browser storage only. Start the server locally to sync with files.';
  }
} 