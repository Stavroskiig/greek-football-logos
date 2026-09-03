import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { TeamService } from '../../services/team.service';
import { Team } from '../../models/team';
import { Logo } from '../../models/logo';

@Component({
  selector: 'app-team-history',
  standalone: true,
  imports: [CommonModule, TranslatePipe, RouterModule],
  templateUrl: './team-history.component.html'
})
export class TeamHistoryComponent implements OnInit {
  team: Team | null = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private teamService: TeamService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadTeam(id);
      }
    });
  }

  loadTeam(id: string) {
    this.loading = true;
    this.teamService.getTeamsByIds([id]).subscribe(page => {
      if (page && page.content && page.content.length > 0) {
        this.team = page.content[0];
        if (this.team.historicalLogos) {
          this.team.historicalLogos.sort((a, b) => {
            const yearA = a.startYear || 0;
            const yearB = b.startYear || 0;
            return yearA - yearB;
          });
        }
      }
      this.loading = false;
    });
  }

  get chunkedLogos() {
    if (!this.team || !this.team.historicalLogos) return [];
    
    const chunkSize = 4;
    const chunks = [];
    for (let i = 0; i < this.team.historicalLogos.length; i += chunkSize) {
      chunks.push(this.team.historicalLogos.slice(i, i + chunkSize));
    }
    return chunks;
  }

  getEmptySlots(count: number): number[] {
    return new Array(Math.max(0, count)).fill(0);
  }
}
