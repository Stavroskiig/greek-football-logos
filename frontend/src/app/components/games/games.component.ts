import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-games',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './games.component.html',
  styleUrl: './games.component.css'
})
export class GamesComponent {
  games = [
    {
      id: 'logo-quiz',
      title: 'Logo Quiz',
      description: 'Test your knowledge of Greek football team logos',
      icon: '🎯',
      color: 'from-purple-500 to-blue-600',
      bgColor: 'bg-gradient-to-r from-purple-500 to-blue-600',
      route: '/quiz',
      status: 'active',
      difficulty: 'Easy - Hard',
      players: '1 Player'
    },
    {
      id: 'memory-game',
      title: 'Memory Game',
      description: 'Match team logos in this classic memory game',
      icon: '🧠',
      color: 'from-green-500 to-teal-600',
      bgColor: 'bg-gradient-to-r from-green-500 to-teal-600',
      route: '/games/memory',
      status: 'coming-soon',
      difficulty: 'Easy - Medium',
      players: '1 Player'
    },
    {
      id: 'chess-game',
      title: 'Chess',
      description: 'Play chess with Greek football themed pieces',
      icon: '♟️',
      color: 'from-amber-500 to-orange-600',
      bgColor: 'bg-gradient-to-r from-amber-500 to-orange-600',
      route: '/games/chess',
      status: 'coming-soon',
      difficulty: 'All Levels',
      players: '1-2 Players'
    }
  ];

  constructor(private router: Router) {}

  navigateToGame(game: any) {
    if (game.status === 'active') {
      this.router.navigate([game.route]);
    }
    // Coming soon games don't navigate anywhere
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'coming-soon':
        return 'bg-yellow-100 text-yellow-800';
      case 'beta':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'active':
        return 'Available';
      case 'coming-soon':
        return 'Coming Soon';
      case 'beta':
        return 'Beta';
      default:
        return 'Unknown';
    }
  }
} 