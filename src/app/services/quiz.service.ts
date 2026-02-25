import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { LogoService } from './logo.service';
import {
  QuizQuestion,
  QuizGame,
  QuizMode,
  QuizSettings,
  QuizStats,
  QuizAnswer
} from '../models/quiz';
import { TeamLogo } from '../models/team-logo';

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private currentGame$ = new BehaviorSubject<QuizGame | null>(null);
  private quizStats$ = new BehaviorSubject<QuizStats>(this.getDefaultStats());

  constructor(private logoService: LogoService) {
    this.loadStats();
  }

  getCurrentGame(): Observable<QuizGame | null> {
    return this.currentGame$.asObservable();
  }

  getQuizStats(): Observable<QuizStats> {
    return this.quizStats$.asObservable();
  }

  createNewGame(settings: QuizSettings): Observable<QuizGame> {
    console.log('Creating new game with settings:', settings);
    return this.logoService.getAllLogos().pipe(
      map(logos => {
        console.log('Loaded logos:', logos.length);
        const questions = this.generateQuestions(logos, settings);
        console.log('Generated questions:', questions.length);
        const game: QuizGame = {
          id: this.generateGameId(),
          mode: settings.mode,
          questions,
          currentQuestionIndex: 0,
          score: 0,
          totalQuestions: questions.length,
          timeStarted: new Date(),
          answers: []
        };

        console.log('Created game:', game);
        this.currentGame$.next(game);
        return game;
      })
    );
  }

  private generateQuestions(logos: TeamLogo[], settings: QuizSettings): QuizQuestion[] {
    const questions: QuizQuestion[] = [];
    const shuffledLogos = this.shuffleArray([...logos]);

    // Filter logos based on difficulty
    let filteredLogos = this.filterLogosByDifficulty(shuffledLogos, settings.difficulty);

    // Take required number of logos
    const selectedLogos = filteredLogos.slice(0, settings.questionCount);

    selectedLogos.forEach((logo, index) => {
      const question = this.createQuestion(logo, logos, settings, index);
      questions.push(question);
    });

    return this.shuffleArray(questions);
  }

  private createQuestion(
    logo: TeamLogo,
    allLogos: TeamLogo[],
    settings: QuizSettings,
    index: number
  ): QuizQuestion {
    const difficulty = this.getDifficulty(logo, settings.difficulty);
    const points = this.getPointsForDifficulty(difficulty);

    // Filter logos based on difficulty for options
    const filteredLogos = this.filterLogosByDifficulty(allLogos, settings.difficulty);

    let options: string[];
    let correctAnswer: string;

    const isTeamQuestion = settings.mode === 'guess-team' ||
      (settings.mode === 'mixed' && Math.random() > 0.5);

    if (isTeamQuestion) {
      correctAnswer = logo.name;
      options = this.generateTeamOptions(logo, filteredLogos);
    } else {
      correctAnswer = logo.league || 'Unknown';
      options = this.generateLeagueOptions(logo, filteredLogos);
    }

    return {
      id: `question-${index}`,
      logoPath: logo.path,
      correctAnswer,
      options: this.shuffleArray(options),
      difficulty,
      points
    };
  }

  private generateTeamOptions(correctLogo: TeamLogo, allLogos: TeamLogo[]): string[] {
    const options = [correctLogo.name];
    const otherLogos = allLogos.filter(logo => logo.id !== correctLogo.id);
    const shuffledOthers = this.shuffleArray(otherLogos);

    // Add 3 random team names
    for (let i = 0; i < 3 && i < shuffledOthers.length; i++) {
      options.push(shuffledOthers[i].name);
    }

    return options;
  }

  private generateLeagueOptions(correctLogo: TeamLogo, allLogos: TeamLogo[]): string[] {
    const options = [correctLogo.league || 'Unknown'];
    const allLeagues = [...new Set(allLogos.map(logo => logo.league).filter(Boolean))];
    const otherLeagues = allLeagues.filter(league => league !== correctLogo.league);
    const shuffledOthers = this.shuffleArray(otherLeagues);

    // Add 3 random leagues
    for (let i = 0; i < 3 && i < shuffledOthers.length; i++) {
      const league = shuffledOthers[i];
      if (league && typeof league === 'string') {
        options.push(league);
      }
    }

    return options;
  }



  private getDifficulty(logo: TeamLogo, difficultySetting: string): 'easy' | 'medium' | 'hard' {
    if (difficultySetting === 'mixed') {
      const rand = Math.random();
      if (rand < 0.4) return 'easy';
      if (rand < 0.8) return 'medium';
      return 'hard';
    }
    return difficultySetting as 'easy' | 'medium' | 'hard';
  }

  private filterLogosByDifficulty(logos: TeamLogo[], difficulty: string): TeamLogo[] {
    if (difficulty === 'mixed') return logos;

    if (difficulty === 'easy') {
      // Easy: Only SUPERLEAGUE and SUPERLEAGUE 2
      return logos.filter(logo =>
        logo.league === 'SUPERLEAGUE' || logo.league === 'SUPERLEAGUE 2'
      );
    } else if (difficulty === 'medium') {
      // Medium: SUPERLEAGUE, SUPERLEAGUE 2, and Γ ΕΘΝΙΚΗ
      return logos.filter(logo =>
        logo.league === 'SUPERLEAGUE' ||
        logo.league === 'SUPERLEAGUE 2' ||
        logo.league === 'Γ ΕΘΝΙΚΗ'
      );
    } else {
      // Hard: All teams from all leagues
      return logos;
    }
  }

  private getPointsForDifficulty(difficulty: 'easy' | 'medium' | 'hard'): number {
    switch (difficulty) {
      case 'easy': return 10;
      case 'medium': return 20;
      case 'hard': return 30;
      default: return 15;
    }
  }

  submitAnswer(questionId: string, selectedAnswer: string, timeSpent: number): void {
    const currentGame = this.currentGame$.value;
    if (!currentGame) return;

    const question = currentGame.questions.find(q => q.id === questionId);
    if (!question) return;

    const isCorrect = selectedAnswer === question.correctAnswer;
    const points = isCorrect ? question.points : 0;

    const answer: QuizAnswer = {
      questionId,
      selectedAnswer,
      correctAnswer: question.correctAnswer,
      isCorrect,
      timeSpent,
      points
    };

    const updatedGame: QuizGame = {
      ...currentGame,
      score: currentGame.score + points,
      answers: [...currentGame.answers, answer]
    };

    this.currentGame$.next(updatedGame);
  }

  nextQuestion(): void {
    const currentGame = this.currentGame$.value;
    if (!currentGame) return;

    console.log('Moving to next question. Current index:', currentGame.currentQuestionIndex);

    const updatedGame: QuizGame = {
      ...currentGame,
      currentQuestionIndex: currentGame.currentQuestionIndex + 1
    };

    console.log('Updated game with new index:', updatedGame.currentQuestionIndex);
    this.currentGame$.next(updatedGame);
  }

  finishGame(): void {
    const currentGame = this.currentGame$.value;
    if (!currentGame) return;

    const finishedGame: QuizGame = {
      ...currentGame,
      timeEnded: new Date()
    };

    this.currentGame$.next(finishedGame);
    this.updateStats(finishedGame);
    this.saveStats();
  }

  private updateStats(game: QuizGame): void {
    const currentStats = this.quizStats$.value;
    const gameDuration = game.timeEnded ?
      (game.timeEnded.getTime() - game.timeStarted.getTime()) / 1000 : 0;

    const newStats: QuizStats = {
      totalGames: currentStats.totalGames + 1,
      totalQuestions: currentStats.totalQuestions + game.totalQuestions,
      correctAnswers: currentStats.correctAnswers + game.answers.filter(a => a.isCorrect).length,
      averageScore: this.calculateAverageScore([...currentStats.gamesPlayed, game]),
      bestScore: Math.max(currentStats.bestScore, game.score),
      averageTime: this.calculateAverageTime([...currentStats.gamesPlayed, game]),
      favoriteMode: this.calculateFavoriteMode([...currentStats.gamesPlayed, game]),
      gamesPlayed: [...currentStats.gamesPlayed, game]
    };

    this.quizStats$.next(newStats);
  }

  private calculateAverageScore(games: QuizGame[]): number {
    if (games.length === 0) return 0;
    const totalScore = games.reduce((sum, game) => sum + game.score, 0);
    return Math.round(totalScore / games.length);
  }

  private calculateAverageTime(games: QuizGame[]): number {
    const completedGames = games.filter(game => game.timeEnded);
    if (completedGames.length === 0) return 0;

    const totalTime = completedGames.reduce((sum, game) => {
      try {
        if (!game.timeEnded || !game.timeStarted) return sum;
        const timeEnded = game.timeEnded instanceof Date ? game.timeEnded : new Date(game.timeEnded);
        const timeStarted = game.timeStarted instanceof Date ? game.timeStarted : new Date(game.timeStarted);
        return sum + (timeEnded.getTime() - timeStarted.getTime()) / 1000;
      } catch (error) {
        console.error('Error calculating game time:', error);
        return sum;
      }
    }, 0);

    return Math.round(totalTime / completedGames.length);
  }

  private calculateFavoriteMode(games: QuizGame[]): QuizMode {
    const modeCounts = games.reduce((counts, game) => {
      counts[game.mode] = (counts[game.mode] || 0) + 1;
      return counts;
    }, {} as Record<QuizMode, number>);

    return Object.entries(modeCounts).reduce((favorite, [mode, count]) =>
      count > (modeCounts[favorite] || 0) ? mode as QuizMode : favorite
      , 'guess-team' as QuizMode);
  }

  private getDefaultStats(): QuizStats {
    return {
      totalGames: 0,
      totalQuestions: 0,
      correctAnswers: 0,
      averageScore: 0,
      bestScore: 0,
      averageTime: 0,
      favoriteMode: 'guess-team',
      gamesPlayed: []
    };
  }

  private loadStats(): void {
    const savedStats = localStorage.getItem('quiz-stats');
    if (savedStats) {
      try {
        const stats = JSON.parse(savedStats);
        // Convert date strings back to Date objects
        if (stats.gamesPlayed) {
          stats.gamesPlayed = stats.gamesPlayed.map((game: any) => ({
            ...game,
            timeStarted: new Date(game.timeStarted),
            timeEnded: game.timeEnded ? new Date(game.timeEnded) : undefined
          }));
        }
        this.quizStats$.next(stats);
      } catch (error) {
        console.error('Error loading quiz stats:', error);
      }
    }
  }

  private saveStats(): void {
    const stats = this.quizStats$.value;
    localStorage.setItem('quiz-stats', JSON.stringify(stats));
  }

  private generateGameId(): string {
    return `game-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  resetStats(): void {
    this.quizStats$.next(this.getDefaultStats());
    localStorage.removeItem('quiz-stats');
  }
} 