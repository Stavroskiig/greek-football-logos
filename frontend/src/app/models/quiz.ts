export interface QuizQuestion {
  id: string;
  logoPath: string;
  correctAnswer: string;
  options: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
}

export interface QuizGame {
  id: string;
  mode: QuizMode;
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  score: number;
  totalQuestions: number;
  timeStarted: Date;
  timeEnded?: Date;
  answers: QuizAnswer[];
}

export interface QuizAnswer {
  questionId: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  timeSpent: number; // in seconds
  points: number;
}

export type QuizMode = 'guess-team' | 'guess-league' | 'mixed';

export interface QuizSettings {
  mode: QuizMode;
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  questionCount: number;
  timeLimit?: number; // in seconds, optional
  showTimer: boolean;
  logoBlur: boolean;
}

export interface QuizStats {
  totalGames: number;
  totalQuestions: number;
  correctAnswers: number;
  averageScore: number;
  bestScore: number;
  averageTime: number;
  favoriteMode: QuizMode;
  gamesPlayed: QuizGame[];
} 