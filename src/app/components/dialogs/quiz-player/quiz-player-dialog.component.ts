// angular
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  inject,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

// common
import { DialogResultStatus } from '../../enums/dialog.enums';
import { QuizOutcome, QuizScreen } from '../../enums/quiz-player.enums';
import { DialogResult } from '../../models/dialog.models';
import {
  QuizPlayerConfig,
  QuizPlayerOption,
  QuizPlayerQuestion,
  QuizPlayerResult,
} from '../../models/quiz-player.models';

// Frases padrão, podem ser trocadas pela config
const DEFAULT_CORRECT_PHRASES: string[] = [
  'Essa você mandou bem!',
  'Isso aí, continua assim.',
  'Acertou em cheio.',
  'Tá dominando o assunto!',
  'Mais uma na conta.',
  'Boa! Segue o jogo.',
];

const DEFAULT_WRONG_PHRASES: string[] = [
  'Dessa vez não foi, mas segue.',
  'Errar faz parte de aprender.',
  'Quase lá — respira e vai pra próxima.',
  'Uma vida a menos, mas o jogo continua.',
  'Anota essa pra não esquecer.',
  'Tudo bem, a próxima é sua.',
];

@Component({
  selector: 'app-quiz-player-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './quiz-player-dialog.component.html',
  styleUrls: ['./quiz-player-dialog.component.scss'],
})
export class QuizPlayerDialogComponent implements OnDestroy {
  private readonly dialogRef =
    inject<MatDialogRef<QuizPlayerDialogComponent, DialogResult<QuizPlayerResult>>>(MatDialogRef);

  private readonly cdr = inject(ChangeDetectorRef);

  protected readonly config: QuizPlayerConfig = inject(MAT_DIALOG_DATA);
  protected readonly QuizScreen = QuizScreen;

  protected readonly questions: QuizPlayerQuestion[] = this.config.questions ?? [];
  protected readonly totalLives: number = this.calculateLives();

  protected screen: QuizScreen = QuizScreen.INTRO;
  protected index = 0;
  protected lives: number = this.totalLives;
  protected correctCount = 0;
  protected answeredCount = 0;

  protected direction = 1;
  protected animationTick = 0;

  protected lastWasCorrect = false;
  protected feedbackPhrase = '';
  protected chosenOption: QuizPlayerOption | null = null;

  private feedbackTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    if (!this.questions.length) this.close(QuizOutcome.ABANDONED);
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

  // Estado derivado (usado no template)

  protected get currentQuestion(): QuizPlayerQuestion {
    return this.questions[this.index];
  }

  protected get lifeSlots(): number[] {
    return Array.from({ length: this.totalLives }, (_, i) => i);
  }

  protected get progressLabel(): string {
    return `${this.index + 1} / ${this.questions.length}`;
  }

  private calculateLives(): number {
    const ratio = this.config.lifeRatio ?? 0.2;
    return Math.max(1, Math.ceil(this.questions.length * ratio));
  }

  // Fluxo

  protected start(): void {
    this.goTo(QuizScreen.QUESTION);
  }

  protected answer(option: QuizPlayerOption): void {
    if (this.chosenOption) return;

    this.chosenOption = option;
    this.lastWasCorrect = option.right_answer;
    this.answeredCount++;

    if (option.right_answer) this.correctCount++;
    else this.lives--;

    this.feedbackPhrase = this.pickPhrase(option.right_answer);
    this.goTo(QuizScreen.FEEDBACK);
    this.startFeedbackTimer();
  }

  protected advance(): void {
    if (this.screen !== QuizScreen.FEEDBACK) return;

    this.clearTimer();
    this.chosenOption = null;

    if (this.lives <= 0) {
      this.goTo(QuizScreen.GAME_OVER);
      return;
    }

    if (this.index + 1 >= this.questions.length) {
      this.goTo(QuizScreen.FINISHED);
      return;
    }

    this.index++;
    this.goTo(QuizScreen.QUESTION);
  }

  protected finish(): void {
    this.close(this.screen === QuizScreen.GAME_OVER ? QuizOutcome.FAILED : QuizOutcome.PASSED);
  }

  protected abandon(): void {
    this.close(QuizOutcome.ABANDONED);
  }

  // Internos
  private goTo(screen: QuizScreen): void {
    this.direction = 1;
    this.screen = screen;
    this.animationTick++;
  }

  private startFeedbackTimer(): void {
    this.clearTimer();

    this.feedbackTimer = setTimeout(() => {
      this.advance();
      this.cdr.markForCheck();
    }, this.config.feedbackDelay ?? 5000);
  }

  private clearTimer(): void {
    if (this.feedbackTimer) {
      clearTimeout(this.feedbackTimer);
      this.feedbackTimer = null;
    }
  }

  private pickPhrase(correct: boolean): string {
    const phrases = correct
      ? (this.config.correctPhrases ?? DEFAULT_CORRECT_PHRASES)
      : (this.config.wrongPhrases ?? DEFAULT_WRONG_PHRASES);

    return phrases[Math.floor(Math.random() * phrases.length)];
  }

  private close(outcome: QuizOutcome): void {
    this.clearTimer();

    this.dialogRef.close({
      status:
        outcome === QuizOutcome.ABANDONED
          ? DialogResultStatus.CANCELLED
          : DialogResultStatus.CONFIRMED,
      confirmed: outcome !== QuizOutcome.ABANDONED,
      data: {
        outcome,
        correctCount: this.correctCount,
        answeredCount: this.answeredCount,
        totalQuestions: this.questions.length,
        livesLeft: Math.max(0, this.lives),
      },
    });
  }
}
