import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { QuizService } from '../../services/quiz.service';
import { QuizSettings, QuizStats } from '../../models/quiz';

@Component({
  selector: 'app-quiz-menu',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './quiz-menu.component.html',
  styleUrls: ['./quiz-menu.component.css']
})
export class QuizMenuComponent implements OnInit {
  settings: QuizSettings = {
    mode: 'guess-team',
    difficulty: 'hard',
    questionCount: 10,
    showTimer: true,
    logoBlur: true
  };

  stats: QuizStats | null = null;
  showSettings = false;
  showStats = false;

  constructor(
    private quizService: QuizService,
    private router: Router
  ) {}

  ngOnInit() {
    this.quizService.getQuizStats().subscribe(stats => {
      this.stats = stats;
    });
  }

  startGame() {
    this.router.navigate(['/quiz/game'], { 
      queryParams: { 
        mode: this.settings.mode,
        difficulty: this.settings.difficulty,
        questions: this.settings.questionCount,
        timer: this.settings.showTimer,
        blur: this.settings.logoBlur
      }
    });
  }

  toggleSettings() {
    this.showSettings = !this.showSettings;
    if (this.showSettings) {
      this.showStats = false;
    }
  }

  toggleStats() {
    this.showStats = !this.showStats;
    if (this.showStats) {
      this.showSettings = false;
    }
  }

  resetStats() {
    if (confirm('Are you sure you want to reset all statistics? This cannot be undone.')) {
      this.quizService.resetStats();
    }
  }

  getModeDescription(mode: string): string {
    switch (mode) {
      case 'guess-team':
        return 'Identify the team from their logo';
      case 'guess-league':
        return 'Identify the league from the team logo';
      case 'mixed':
        return 'Mix of team and league identification';
      default:
        return '';
    }
  }

  getDifficultyDescription(difficulty: string): string {
    switch (difficulty) {
      case 'easy':
        return 'SUPERLEAGUE & SUPERLEAGUE 2 teams only';
      case 'medium':
        return 'SUPERLEAGUE, SUPERLEAGUE 2 & Γ ΕΘΝΙΚΗ teams';
      case 'hard':
        return 'All teams from all leagues';
      case 'mixed':
        return 'Random mix of difficulties';
      default:
        return '';
    }
  }

  getQuestionCountDescription(count: number): string {
    if (count <= 5) return 'Quick game';
    if (count <= 10) return 'Standard game';
    if (count <= 15) return 'Extended game';
    return 'Marathon game';
  }

  getAccuracyPercentage(): number {
    if (!this.stats || this.stats.totalQuestions === 0) return 0;
    return Math.round((this.stats.correctAnswers / this.stats.totalQuestions) * 100);
  }

  getAverageTimeString(): string {
    if (!this.stats || this.stats.averageTime === 0) return '0:00';
    const minutes = Math.floor(this.stats.averageTime / 60);
    const seconds = this.stats.averageTime % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  getFavoriteModeText(mode: string): string {
    switch (mode) {
      case 'guess-team': return 'Team Guessing';
      case 'guess-league': return 'League Guessing';
      case 'mixed': return 'Mixed Mode';
      default: return 'Unknown';
    }
  }
} 