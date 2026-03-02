import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { TeamInfo } from '../models/team-info';

@Injectable({
  providedIn: 'root'
})
export class TeamInfoService {
  constructor(private http: HttpClient) {}

  getTeamInfo(teamId: string): Observable<TeamInfo> {
    return this.http.get<{teams: {[key: string]: TeamInfo}}>('assets/data/teams.json')
      .pipe(
        map(response => {
          const teamInfo = response.teams[teamId];
          if (!teamInfo) {
            throw new Error(`Team with ID ${teamId} not found`);
          }
          return teamInfo;
        })
      );
  }

  getAllTeamsInfo(): Observable<TeamInfo[]> {
    return this.http.get<{teams: {[key: string]: TeamInfo}}>('assets/data/teams.json')
      .pipe(
        map(response => Object.values(response.teams))
      );
  }
} 