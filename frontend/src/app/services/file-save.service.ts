import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FileSaveService {
  private readonly TEAM_TAGS_API_URL = 'http://localhost:3000/api/team-tags';
  private readonly AVAILABLE_TAGS_API_URL = 'http://localhost:3000/api/available-tags';

  constructor(private http: HttpClient) {}

  saveTeamTags(teamTags: { [teamId: string]: string[] }): Observable<boolean> {
    // Make actual HTTP request to backend API
    return this.http.post<boolean>(this.TEAM_TAGS_API_URL, teamTags).pipe(
      tap(() => {
        console.log('Team tags saved successfully to external file');
      }),
      catchError(error => {
        console.error('Error saving team tags:', error);
        // Fallback: download file for manual replacement
        this.downloadTeamTagsFile(teamTags);
        return of(false);
      })
    );
  }

  saveAvailableTags(availableTags: string[]): Observable<boolean> {
    // Make actual HTTP request to backend API
    return this.http.post<boolean>(this.AVAILABLE_TAGS_API_URL, availableTags).pipe(
      tap(() => {
        console.log('Available tags saved successfully to external file');
      }),
      catchError(error => {
        console.error('Error saving available tags:', error);
        // Fallback: download file for manual replacement
        this.downloadAvailableTagsFile(availableTags);
        return of(false);
      })
    );
  }

  // Method to manually trigger file save (for development)
  downloadTeamTagsFile(teamTags: { [teamId: string]: string[] }): void {
    const dataStr = JSON.stringify(teamTags, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'team-tags.json';
    link.click();
    URL.revokeObjectURL(url);
  }

  downloadAvailableTagsFile(availableTags: string[]): void {
    const dataStr = JSON.stringify(availableTags, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'available-tags.json';
    link.click();
    URL.revokeObjectURL(url);
  }

  // Method to copy to clipboard for manual file replacement
  copyToClipboard(teamTags: { [teamId: string]: string[] }): void {
    const dataStr = JSON.stringify(teamTags, null, 2);
    navigator.clipboard.writeText(dataStr).then(() => {
      console.log('Team tags copied to clipboard. You can now paste into src/assets/data/team-tags.json');
    }).catch(err => {
      console.error('Failed to copy to clipboard:', err);
    });
  }
} 