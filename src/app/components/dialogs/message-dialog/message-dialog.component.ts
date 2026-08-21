import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

import { DialogResultStatus, DialogVariant } from '../../enums/dialog.enums';
import { DialogResult, MessageDialogConfig } from '../../models/dialog.models';

@Component({
  selector: 'app-message-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: "./message-dialog.component.html",
  styleUrls: ["./message-dialog.component.scss"],
})
export class MessageDialogComponent {
  protected readonly config: MessageDialogConfig = inject(MAT_DIALOG_DATA);

  private readonly dialogRef =
    inject<MatDialogRef<MessageDialogComponent, DialogResult<void>>>(MatDialogRef);

  protected get variant(): DialogVariant {
    return this.config.variant ?? DialogVariant.INFO;
  }

  /** Símbolo do selo — texto puro, sem depender da fonte de ícones do Material. */
  protected get glyph(): string {
    const glyphs: Record<DialogVariant, string> = {
      [DialogVariant.INFO]: 'i',
      [DialogVariant.SUCCESS]: '✓',
      [DialogVariant.WARNING]: '!',
      [DialogVariant.ERROR]: '×',
      [DialogVariant.CONFIRM]: '?',
    };
    return glyphs[this.variant];
  }

  protected get buttonColor(): 'primary' | 'warn' {
    return this.variant === DialogVariant.ERROR ? 'warn' : 'primary';
  }

  protected confirm(): void {
    this.dialogRef.close({ status: DialogResultStatus.CONFIRMED, confirmed: true });
  }

  protected cancel(): void {
    this.dialogRef.close({ status: DialogResultStatus.CANCELLED, confirmed: false });
  }
}
