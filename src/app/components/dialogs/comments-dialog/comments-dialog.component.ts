// angular
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

// components
import { CommentsComponent } from '../../comments/comments.component';

// common
import { DialogResultStatus } from '../../enums/dialog.enums';
import { DialogResult } from '../../models/dialog.models';
import { CommentsDialogConfig } from '../../models/comments-dialog.models';

@Component({
  selector: 'app-comments-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatDialogModule
    , MatButtonModule
    , MatIconModule
    , CommentsComponent
  ],
  templateUrl: './comments-dialog.component.html',
  styleUrls: ['./comments-dialog.component.scss']
})
export class CommentsDialogComponent {
  private readonly dialogRef =
    inject<MatDialogRef<CommentsDialogComponent, DialogResult<void>>>(MatDialogRef);

  protected readonly config: CommentsDialogConfig = inject(MAT_DIALOG_DATA);

  protected close(): void {
    this.dialogRef.close({
      status: DialogResultStatus.CONFIRMED,
      confirmed: true,
    });
  }
}
