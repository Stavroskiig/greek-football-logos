import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  template: `
    <header class="header">
      <nav class="nav">
        <a routerLink="/" class="nav-link">Home</a>
        <a routerLink="/suggest" class="nav-link">Suggest Logo</a>
      </nav>
    </header>
  `,
  styles: [`
    .header {
      background-color: #f8f9fa;
      padding: 1rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .nav {
      display: flex;
      gap: 1rem;
      justify-content: center;
    }
    .nav-link {
      color: #333;
      text-decoration: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      transition: background-color 0.2s;
    }
    .nav-link:hover {
      background-color: #e9ecef;
    }
    .nav-link.active {
      background-color: #dee2e6;
    }
  `]
})
export class HeaderComponent {} 