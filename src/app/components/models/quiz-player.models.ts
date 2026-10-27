import { DialogSize } from '../enums/dialog.enums';
import { QuizOutcome } from '../enums/quiz-player.enums';

export interface QuizPlayerOption {
  id: number;
  text: string;
  right_answer: boolean;
}

export interface QuizPlayerQuestion {
  image: string;
  options: QuizPlayerOption[];
}

export interface QuizPlayerConfig {
  questions: QuizPlayerQuestion[];
  title?: string;
  size?: DialogSize;
  lifeRatio?: number;
  feedbackDelay?: number;
  correctPhrases?: string[];
  wrongPhrases?: string[];
}

export interface QuizPlayerResult {
  outcome: QuizOutcome;
  correctCount: number;
  answeredCount: number;
  totalQuestions: number;
  livesLeft: number;
}
