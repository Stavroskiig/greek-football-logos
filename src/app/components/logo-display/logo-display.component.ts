import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LogoService } from '../../services/logo.service';
import { Observable, combineLatest, map } from 'rxjs';
import { LogoItemComponent } from '../logo-item/logo-item.component';
import { Logo } from '../../models/logo';

@Component({
  selector: 'app-logo-display',
  standalone: true,
  imports: [CommonModule, FormsModule, LogoItemComponent],
  templateUrl: './logo-display.component.html',
  styleUrls: ['./logo-display.component.css']
})
export class LogoDisplayComponent implements OnInit {
  searchTerm: string = '';
  selectedLeague: string = 'SUPERLEAGUE';
  logos$: Observable<Logo[]>;
  leagues$: Observable<string[]>;

  constructor(private logoService: LogoService) {
    this.logos$ = this.logoService.getLogos();
    this.leagues$ = this.logoService.getLeagues();
  }

  ngOnInit() {
    this.applyFilters();
  }

  applyFilters() {
    this.logos$ = combineLatest([
      this.logoService.getLogos(),
      this.logoService.getLeagues()
    ]).pipe(
      map(([logos, leagues]) => {
        return logos.filter(logo => {
          const matchesSearch = !this.searchTerm || 
            this.normalizeString(logo.name).includes(this.normalizeString(this.searchTerm));
          const matchesLeague = !this.selectedLeague || logo.league === this.selectedLeague;
          return matchesSearch && matchesLeague;
        });
      })
    );
  }

  clearSearch() {
    this.searchTerm = '';
    this.applyFilters();
  }

  private normalizeString(str: string): string {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9α-ωά-ώ]/g, '');
  }
}