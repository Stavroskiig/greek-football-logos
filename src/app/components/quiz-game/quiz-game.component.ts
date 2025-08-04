import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil, interval } from 'rxjs';
import { QuizService } from '../../services/quiz.service';
import { QuizSettings, QuizGame, QuizQuestion } from '../../models/quiz';

@Component({
  selector: 'app-quiz-game',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './quiz-game.component.html',
  styleUrls: ['./quiz-game.component.css']
})
export class QuizGameComponent implements OnInit, OnDestroy {
  currentGame: QuizGame | null = null;
  currentQuestion: QuizQuestion | null = null;
  selectedAnswer: string = '';
  timeElapsed: number = 0;
  gameTimer: any;
  isAnswerSubmitted: boolean = false;
  isGameFinished: boolean = false;
  
  // Game settings
  settings: QuizSettings = {
    mode: 'guess-team',
    difficulty: 'hard',
    questionCount: 10,
    showTimer: true,
    logoBlur: true
  };

  private destroy$ = new Subject<void>();

  constructor(
    private quizService: QuizService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.loadSettingsFromQueryParams();
    this.startNewGame();
    
    // Subscribe to game updates from the service
    this.quizService.getCurrentGame().pipe(
      takeUntil(this.destroy$)
    ).subscribe(game => {
      console.log('Received game update:', game);
      if (game) {
        this.currentGame = game;
        if (game.currentQuestionIndex < game.questions.length) {
          this.currentQuestion = game.questions[game.currentQuestionIndex];
          console.log('Updated current question:', this.currentQuestion);
          
          // Start timer only for the first question
          if (game.currentQuestionIndex === 0) {
            this.startTimer();
          }
        }
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.gameTimer) {
      clearInterval(this.gameTimer);
    }
  }

  private loadSettingsFromQueryParams() {
    this.route.queryParams.subscribe(params => {
      if (params['mode']) {
        this.settings.mode = params['mode'] as any;
      }
      if (params['difficulty']) {
        this.settings.difficulty = params['difficulty'] as any;
      }
      if (params['questions']) {
        this.settings.questionCount = parseInt(params['questions']);
      }

      if (params['timer'] !== undefined) {
        this.settings.showTimer = params['timer'] === 'true';
      }
      if (params['blur'] !== undefined) {
        this.settings.logoBlur = params['blur'] === 'true';
      }
    });
  }

  startNewGame() {
    console.log('Starting new game with settings:', this.settings);
    this.quizService.createNewGame(this.settings).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (game) => {
        console.log('Game created successfully:', game);
        // The subscription in ngOnInit will handle updating currentGame and currentQuestion
        // Timer will be started when the first question is loaded
      },
      error: (error) => {
        console.error('Error creating game:', error);
      }
    });
  }

  private startTimer() {
    // Clear any existing timer first
    this.stopTimer();
    this.timeElapsed = 0;
    this.gameTimer = setInterval(() => {
      this.timeElapsed++;
    }, 1000);
  }

  private stopTimer() {
    if (this.gameTimer) {
      clearInterval(this.gameTimer);
      this.gameTimer = null;
    }
  }

  submitAnswer() {
    if (!this.currentQuestion || this.isAnswerSubmitted) return;

    this.quizService.submitAnswer(
      this.currentQuestion.id, 
      this.selectedAnswer, 
      this.timeElapsed
    );

    this.isAnswerSubmitted = true;
    
    // Stop timer if this is the last question
    if (this.isLastQuestion()) {
      this.stopTimer();
    }
  }

  nextQuestion() {
    if (!this.currentGame) return;

    // Check if game is finished
    if (this.isLastQuestion()) {
      this.finishGame();
      return;
    }

    // Reset UI state
    this.selectedAnswer = '';
    this.isAnswerSubmitted = false;
    
    // Update the game state in the service
    this.quizService.nextQuestion();
    
    // Don't restart timer - let it continue running
  }

  finishGame() {
    this.quizService.finishGame();
    this.isGameFinished = true;
    this.stopTimer();
  }

  restartGame() {
    this.isGameFinished = false;
    this.startNewGame();
  }

  goToMenu() {
    this.router.navigate(['/quiz']);
  }

  getCorrectAnswersCount(): number {
    if (!this.currentGame) return 0;
    return this.currentGame.answers.filter(a => a.isCorrect).length;
  }

  getProgressPercentage(): number {
    if (!this.currentGame) return 0;
    return (this.currentGame.currentQuestionIndex / this.currentGame.questions.length) * 100;
  }

  getTimeString(): string {
    const minutes = Math.floor(this.timeElapsed / 60);
    const seconds = this.timeElapsed % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  isCorrectAnswer(answer: string): boolean {
    return this.currentQuestion?.correctAnswer === answer;
  }

  isSelectedAnswer(answer: string): boolean {
    return this.selectedAnswer === answer;
  }

  getAnswerClass(answer: string): string {
    if (!this.isAnswerSubmitted) {
      return this.isSelectedAnswer(answer) ? 'selected' : '';
    }

    if (this.isCorrectAnswer(answer)) {
      return 'correct';
    }

    if (this.isSelectedAnswer(answer) && !this.isCorrectAnswer(answer)) {
      return 'incorrect';
    }

    return '';
  }

  getDifficultyColor(difficulty: string): string {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }

  getDifficultyText(difficulty: string): string {
    switch (difficulty) {
      case 'easy': return 'Easy';
      case 'medium': return 'Medium';
      case 'hard': return 'Hard';
      default: return 'Mixed';
    }
  }

  getLogoBlurClass(difficulty: string): string {
    const blurClass = `logo-blur-${difficulty}`;
    console.log('Applying blur class:', blurClass, 'for difficulty:', difficulty);
    return blurClass;
  }

  getLogoBlurAmount(difficulty: string): string {
    switch (difficulty) {
      case 'easy': return 'blur(2px)';
      case 'medium': return 'blur(4px)';
      case 'hard': return 'blur(6px)';
      default: return 'blur(3px)';
    }
  }

  isLastQuestion(): boolean {
    if (!this.currentGame) return false;
    return this.currentGame.currentQuestionIndex >= this.currentGame.questions.length - 1;
  }
} 