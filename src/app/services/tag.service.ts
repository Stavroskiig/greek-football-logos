import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { TeamLogo } from '../models/team-logo';
import { TagStorageService } from './tag-storage.service';

@Injectable({
  providedIn: 'root'
})
export class TagService {
  


  constructor(private tagStorage: TagStorageService) {}

  getAvailableTags(): Observable<string[]> {
    return this.tagStorage.getTagData().pipe(
      map(data => data.availableTags)
    );
  }

  getTeamTags(teamId: string): string[] {
    const data = this.tagStorage.getCurrentTagData();
    return data.teamTags[teamId] || [];
  }

  getAllTeamTags(): { [teamId: string]: string[] } {
    const data = this.tagStorage.getCurrentTagData();
    return { ...data.teamTags };
  }

  addTagToTeam(teamId: string, tag: string): void {
    this.tagStorage.addTagToTeam(teamId, tag);
  }

  removeTagFromTeam(teamId: string, tag: string): void {
    this.tagStorage.removeTagFromTeam(teamId, tag);
  }

  addNewTag(tag: string): void {
    this.tagStorage.addNewTag(tag);
  }

  getTeamsByTag(tag: string, allTeams: TeamLogo[]): TeamLogo[] {
    return allTeams.filter(team => {
      const teamTags = this.getTeamTags(team.id);
      return teamTags.includes(tag);
    });
  }

  getTeamsByMultipleTags(tags: string[], allTeams: TeamLogo[]): TeamLogo[] {
    if (tags.length === 0) return allTeams;
    
    return allTeams.filter(team => {
      const teamTags = this.getTeamTags(team.id);
      return tags.some(tag => teamTags.includes(tag));
    });
  }
} 