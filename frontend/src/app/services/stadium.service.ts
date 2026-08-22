import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Stadium } from '../models/team';

@Injectable({
  providedIn: 'root'
})
export class StadiumService {
  private apiUrl = `${environment.apiUrl}/stadiums`;

  constructor(private http: HttpClient) { }

  getStadiums(): Observable<Stadium[]> {
    return this.http.get<Stadium[]>(this.apiUrl);
  }

  getStadium(id: number): Observable<Stadium> {
    return this.http.get<Stadium>(`${this.apiUrl}/${id}`);
  }

  createStadium(stadium: Stadium): Observable<Stadium> {
    return this.http.post<Stadium>(this.apiUrl, stadium);
  }

  updateStadium(id: number, stadium: Stadium): Observable<Stadium> {
    return this.http.put<Stadium>(`${this.apiUrl}/${id}`, stadium);
  }

  deleteStadium(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
