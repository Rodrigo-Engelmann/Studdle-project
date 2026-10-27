// angular
import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Overlay } from '@angular/cdk/overlay';

import { Observable, map } from 'rxjs';

import { FormDialogComponent } from '../dialogs/form-dialog/form-dialog.component';
import { MessageDialogComponent } from '../dialogs/message-dialog/message-dialog.component';
import { DialogResultStatus, DialogSize, DialogVariant } from '../enums/dialog.enums';
import {
  DialogResult,
  FormDialogConfig,
  FormFieldConfig,
  MessageDialogConfig,
} from '../models/dialog.models';
import { inferFields } from '../utils/field-inference.util';

// selection dialog sys
import { SelectionDialogComponent } from '../dialogs/selection-dialog/selection-dialog.component';
import { SelectionDialogConfig, SelectionResult } from '../models/selection-dialog.models';

// imports
import { MascotDialogComponent } from '../dialogs/mascot-dialog/mascot-dialog.component';
import { MascotConfig, MascotResult } from '../models/mascot.models';

// quiz dialog sys
import { QuizPlayerDialogComponent } from '../dialogs/quiz-player/quiz-player-dialog.component';
import { QuizPlayerConfig, QuizPlayerResult } from '../models/quiz-player.models';

// comments dialog sys
import { CommentsDialogComponent } from '../dialogs/comments-dialog/comments-dialog.component';
import { CommentsDialogConfig } from '../models/comments-dialog.models';

// notifications dialog sys
import { NotificationsDialogComponent } from '../dialogs/Notifications-dialog/Notifications-dialog.component';
import { CommentThreadDialogComponent } from '../comment-thread-dialog/comment-thread-dialog.component';
import {
  CommentThreadDialogConfig,
  NotificationsDialogConfig,
  NotificationsResult,
} from '../../models/notification.module';

const CANCELLED: DialogResult<never> = {
  status: DialogResultStatus.CANCELLED,
  confirmed: false,
};

@Injectable({ providedIn: 'root' })
export class DialogService {
  private readonly dialog = inject(MatDialog);
  private readonly overlay = inject(Overlay);
  
  //#region forms
  openForm<T extends Record<string, unknown>>(
    config: FormDialogConfig<T>,
  ): Observable<DialogResult<T>> {
    return this.dialog
      .open<FormDialogComponent, FormDialogConfig<T>, DialogResult<T>>(FormDialogComponent, {
        data: config,
        width: config.size ?? DialogSize.MEDIUM,
        maxWidth: '95vw',
        maxHeight: '90vh',
        autoFocus: 'first-tabbable',
        restoreFocus: true,
        disableClose: config.disableClose ?? true,
      })
      .afterClosed()
      .pipe(map((result) => result ?? (CANCELLED as DialogResult<T>)));
  }

  openSelection(config: SelectionDialogConfig): Observable<DialogResult<SelectionResult>> {
    return this.dialog
      .open<SelectionDialogComponent, SelectionDialogConfig, DialogResult<SelectionResult>>(
        SelectionDialogComponent,
        {
          data: config,
          width: config.size ?? DialogSize.MEDIUM,
          maxWidth: '95vw',
          maxHeight: '90vh',
          autoFocus: 'first-tabbable',
          restoreFocus: true,
          disableClose: config.disableClose ?? true,
        },
      )
      .afterClosed()
      .pipe(map((result) => result ?? (CANCELLED as DialogResult<SelectionResult>)));
  }

  openFormFromModel<T extends Record<string, unknown>>(
    title: string,
    model: T,
    overrides: Record<string, Partial<FormFieldConfig>> = {},
    extra: Partial<Omit<FormDialogConfig<T>, 'title' | 'fields' | 'model'>> = {},
  ): Observable<DialogResult<T>> {
    return this.openForm<T>({
      title,
      fields: inferFields(model, overrides),
      model,
      ...extra,
    });
  }
  //#regionend

  //#region messages
  openMessage(config: MessageDialogConfig): Observable<DialogResult<void>> {
    return this.dialog
      .open<MessageDialogComponent, MessageDialogConfig, DialogResult<void>>(
        MessageDialogComponent,
        {
          data: config,
          width: config.size ?? DialogSize.SMALL,
          maxWidth: '95vw',
          autoFocus: 'first-tabbable',
          restoreFocus: true,
          disableClose: config.disableClose ?? false,
        },
      )
      .afterClosed()
      .pipe(map((result) => result ?? CANCELLED));
  }

  confirm(
    title: string,
    message: string,
    options: Partial<Omit<MessageDialogConfig, 'title' | 'message'>> = {},
  ): Observable<boolean> {
    return this.openMessage({
      title,
      message,
      variant: DialogVariant.CONFIRM,
      confirmLabel: 'Confirmar',
      cancelLabel: 'Cancelar',
      ...options,
    }).pipe(map((result) => result.confirmed));
  }

  info(title: string, message: string): Observable<DialogResult<void>> {
    return this.openMessage({ title, message, variant: DialogVariant.INFO });
  }

  success(title: string, message: string): Observable<DialogResult<void>> {
    return this.openMessage({ title, message, variant: DialogVariant.SUCCESS });
  }

  warning(title: string, message: string): Observable<DialogResult<void>> {
    return this.openMessage({ title, message, variant: DialogVariant.WARNING });
  }

  error(title: string, message: string): Observable<DialogResult<void>> {
    return this.openMessage({ title, message, variant: DialogVariant.ERROR });
  }
  //#regionend

  //#region quizzes
  openQuizPlayer(config: QuizPlayerConfig): Observable<DialogResult<QuizPlayerResult>> {
    return this.dialog
      .open<QuizPlayerDialogComponent, QuizPlayerConfig, DialogResult<QuizPlayerResult>>(
        QuizPlayerDialogComponent,
        {
          data: config,
          width: config.size ?? DialogSize.MEDIUM,
          maxWidth: '95vw',
          maxHeight: '90vh',
          autoFocus: 'first-tabbable',
          restoreFocus: true,
          disableClose: true,
        },
      )
      .afterClosed()
      .pipe(map((result) => result ?? (CANCELLED as DialogResult<QuizPlayerResult>)));
  }

  openMascot(config: MascotConfig): Observable<DialogResult<MascotResult>> {
    return this.dialog
      .open<MascotDialogComponent, MascotConfig, DialogResult<MascotResult>>(
        MascotDialogComponent,
        {
          data: config,
          width: '100vw',
          maxWidth: '100vw',
          height: '100vh',
          panelClass: 'mascot-dialog-panel',
          hasBackdrop: false,
          disableClose: !(config.allowSkip ?? true),
          autoFocus: false,
          restoreFocus: true,
        },
      )
      .afterClosed()
      .pipe(map((result) => result ?? (CANCELLED as DialogResult<MascotResult>)));
  }
  //#endregion

  //#region comments
  openCommentsDialog(materialId: number): Observable<DialogResult<void>> {
    return this.openComments({ materialId });
  }

  openVideoCommentsDialog(videoId: number): Observable<DialogResult<void>> {
    return this.openComments({ videoId });
  }

  private openComments(config: CommentsDialogConfig): Observable<DialogResult<void>> {
    return this.dialog
      .open<CommentsDialogComponent, CommentsDialogConfig, DialogResult<void>>(
        CommentsDialogComponent,
        {
          data: config,
          width: config.size ?? DialogSize.MEDIUM,
          maxWidth: '95vw',
          maxHeight: '90vh',
          autoFocus: false,
          restoreFocus: true,
          disableClose: false,
          scrollStrategy: this.overlay.scrollStrategies.noop(),
        },
      )
      .afterClosed()
      .pipe(map((result) => result ?? CANCELLED));
  }
  //#endregion

  //#region notifications
  openNotificationsDialog(
    config: NotificationsDialogConfig = {},
  ): Observable<DialogResult<NotificationsResult>> {
    return this.dialog
      .open<NotificationsDialogComponent, NotificationsDialogConfig, DialogResult<NotificationsResult>>(
        NotificationsDialogComponent,
        {
          data: config,
          width: config.size ?? DialogSize.MEDIUM,
          maxWidth: '95vw',
          maxHeight: '90vh',
          autoFocus: false,
          restoreFocus: true,
          scrollStrategy: this.overlay.scrollStrategies.noop(),
        },
      )
      .afterClosed()
      .pipe(map((result) => result ?? (CANCELLED as DialogResult<NotificationsResult>)));
  }

  openCommentThreadDialog(commentId: number): Observable<DialogResult<void>> {
    return this.dialog
      .open<CommentThreadDialogComponent, CommentThreadDialogConfig, DialogResult<void>>(
        CommentThreadDialogComponent,
        {
          data: { commentId },
          width: DialogSize.MEDIUM,
          maxWidth: '95vw',
          maxHeight: '90vh',
          autoFocus: false,
          restoreFocus: true,
          scrollStrategy: this.overlay.scrollStrategies.noop(),
        },
      )
      .afterClosed()
      .pipe(map((result) => result ?? CANCELLED));
  }
  //#endregion
}
