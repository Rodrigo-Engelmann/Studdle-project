// angular
import { ChangeDetectionStrategy, Component, HostListener, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

// common
import { DialogResultStatus } from '../../enums/dialog.enums';
import { MascotOutcome, MascotSide } from '../../enums/mascot.enums';
import { DialogResult } from '../../models/dialog.models';
import { MascotConfig, MascotResult, MascotStep } from '../../models/mascot.models';

const SAFE_MARGIN_VW = 3;

const MIN_X = 8;
const MAX_X = 92;
const MIN_Y = 12;
const MAX_Y = 88;

@Component({
  selector: 'app-mascot-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './mascot-dialog.component.html',
  styleUrls: ['./mascot-dialog.component.scss'],
})
export class MascotDialogComponent {
  private readonly dialogRef =
    inject<MatDialogRef<MascotDialogComponent, DialogResult<MascotResult>>>(MatDialogRef);

  protected readonly config: MascotConfig = inject(MAT_DIALOG_DATA);
  protected readonly MascotSide = MascotSide;

  protected readonly steps: MascotStep[] = this.config.steps ?? [];
  protected index = 0;

  constructor() {
    if (!this.steps.length) {
      this.close(MascotOutcome.COMPLETED);
      return;
    }

    this.preloadImages();
  }

  protected get step(): MascotStep {
    return this.steps[this.index];
  }

  protected get hint(): string {
    return this.config.hint ?? 'Clique em qualquer lugar para continuar';
  }

  private get x(): number {
    return this.clamp(this.step.pos?.x ?? 50, MIN_X, MAX_X);
  }

  private get y(): number {
    return this.clamp(this.step.pos?.y ?? 50, MIN_Y, MAX_Y);
  }

  protected get side(): MascotSide {
    return this.x > 50 ? MascotSide.LEFT : MascotSide.RIGHT;
  }

  protected get mascotStyle(): Record<string, string> {
    return {
      left: `${this.x}vw`,
      top: `${this.y}vh`,
    };
  }

  protected get bubbleStyle(): Record<string, string> {
    const offset = 'var(--mascot-size) / 2 + var(--mascot-gap)';

    const freeSpace = this.side === MascotSide.RIGHT ? 100 - this.x : this.x;
    const maxWidth = `calc(${freeSpace - SAFE_MARGIN_VW}vw - ${offset})`;

    const anchor: Record<string, string> = this.side === MascotSide.RIGHT
      ? { left: `calc(${this.x}vw + ${offset})` }
      : { right: `calc(${100 - this.x}vw + ${offset})` };

    return {
      ...anchor,
      top: `${this.y}vh`,
      maxWidth,
    };
  }

  @HostListener('click')
  protected advance(): void {
    if (this.index + 1 >= this.steps.length) {
      this.close(MascotOutcome.COMPLETED);
      return;
    }

    this.index++;
  }

  @HostListener('document:keydown', ['$event'])
  protected onKeydown(event: KeyboardEvent): void {
    if (['Enter', ' ', 'ArrowRight'].includes(event.key)) {
      event.preventDefault();
      this.advance();
      return;
    }

    if (event.key === 'Escape' && (this.config.allowSkip ?? true))
      this.close(MascotOutcome.SKIPPED);
  }

  private preloadImages(): void {
    for (const step of this.steps) {
      const img = new Image();
      img.src = step.image;
    }
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
  }

  private close(outcome: MascotOutcome): void {
    this.dialogRef.close({
      status:
        outcome === MascotOutcome.COMPLETED
          ? DialogResultStatus.CONFIRMED
          : DialogResultStatus.CANCELLED,
      confirmed: outcome === MascotOutcome.COMPLETED,
      data: {
        outcome,
        stepsSeen: this.index + 1,
        totalSteps: this.steps.length,
      },
    });
  }
}
