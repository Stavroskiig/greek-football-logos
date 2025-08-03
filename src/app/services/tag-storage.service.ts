import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface TagData {
  availableTags: string[];
  teamTags: { [teamId: string]: string[] };
}

@Injectable({
  providedIn: 'root'
})
export class TagStorageService {
  private readonly STORAGE_KEY = 'greek_football_tags';
  private tagDataSubject = new BehaviorSubject<TagData>({
    availableTags: [],
    teamTags: {}
  });

  constructor() {
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
  }

  addTagToTeam(teamId: string, tag: string): void {
    const currentData = this.getCurrentTagData();
    const currentTeamTags = currentData.teamTags[teamId] || [];
    
    if (!currentTeamTags.includes(tag)) {
      const newTeamTags = [...currentTeamTags, tag];
      this.updateTeamTags(teamId, newTeamTags);
    }
  }

  removeTagFromTeam(teamId: string, tag: string): void {
    const currentData = this.getCurrentTagData();
    const currentTeamTags = currentData.teamTags[teamId] || [];
    const newTeamTags = currentTeamTags.filter(t => t !== tag);
    this.updateTeamTags(teamId, newTeamTags);
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

    // Remove tag from all teams
    const newTeamTags = { ...currentData.teamTags };
    Object.keys(newTeamTags).forEach(teamId => {
      newTeamTags[teamId] = newTeamTags[teamId].filter(t => t !== tag);
    });
    
    const newData: TagData = {
      availableTags: newAvailableTags,
      teamTags: newTeamTags
    };
    this.saveToStorage(newData);
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
      teamTags: {
        'panathinaikos': ['Green', 'Shamrock', 'Classic'],
        'aek': ['Eagles', 'Black', 'Yellow', 'Shields'],
        'paok': ['Black', 'White', 'Double-headed Eagle', 'Classic'],
        'olympiakos': ['Red', 'White', 'Laurel Wreath', 'Classic'],
        'aris': ['Yellow', 'Black', 'Lions', 'Shields'],
        'lamia': ['Blue', 'White', 'Modern'],
        'ofi': ['Green', 'White', 'Classic'],
        'volos': ['Blue', 'White', 'Ships', 'Modern'],
        'asteras-tripolis': ['Yellow', 'Black', 'Stars', 'Modern'],
        'panetolikos': ['Green', 'White', 'Shields', 'Modern'],
        'atromitos': ['Blue', 'White', 'Shields', 'Classic'],
        'panserraikos': ['Blue', 'White', 'Shields', 'Classic'],
        'kallithea': ['Blue', 'White', 'Shields', 'Classic'],
        'levadiakos': ['Blue', 'White', 'Shields', 'Classic']
      }
    };
    this.saveToStorage(defaultData);
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
} 