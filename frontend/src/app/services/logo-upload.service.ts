import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface LogoUploadResponse {
  success: boolean;
  message: string;
  path?: string;
  githubCommitSha?: string;
  commitUrl?: string;
  teamId?: string;
  isHistorical?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class LogoUploadService {
  private apiUrl = `${environment.apiUrl}/logos`;

  constructor(private http: HttpClient) {}

  uploadLogo(formData: FormData): Observable<LogoUploadResponse> {
    return this.http.post<LogoUploadResponse>(`${this.apiUrl}/upload`, formData);
  }

  getAvailableFolders(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/folders`);
  }
}
