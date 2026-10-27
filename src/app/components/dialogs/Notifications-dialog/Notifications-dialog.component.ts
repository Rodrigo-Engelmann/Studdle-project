// angular
import {
  ChangeDetectionStrategy
  , ChangeDetectorRef
  , Component
  , inject
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Overlay } from '@angular/cdk/overlay';
import { Router } from '@angular/router';

// services
import {
  UserNotification
  , UserNotificationService
} from '../../services/user-notifications/user-notifications.service';
import { User, UserService } from '../../../services/users/users.service';

// components
import { CommentThreadDialogComponent } from '../../comment-thread-dialog/comment-thread-dialog.component';

// common
import { DialogResultStatus, DialogSize } from '../../enums/dialog.enums';
import { DialogResult } from '../../models/dialog.models';
import {
  CommentThreadDialogConfig
  , NotificationsDialogConfig
  , NotificationsResult
} from '../../../models/notification.module';

@Component({
  selector: 'app-notifications-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatDialogModule
    , MatButtonModule
    , MatIconModule
  ],
  templateUrl: './notifications-dialog.component.html',
  styleUrls: ['./notifications-dialog.component.scss']
})
export class NotificationsDialogComponent {
  private readonly dialogRef =
    inject<MatDialogRef<NotificationsDialogComponent, DialogResult<NotificationsResult>>>(MatDialogRef);

  private readonly notificationService = inject(UserNotificationService);
  private readonly userService = inject(UserService);
  private readonly cdr = inject(ChangeDetectorRef);

  private readonly dialog = inject(MatDialog);
  private readonly overlay = inject(Overlay);

  protected readonly config: NotificationsDialogConfig = inject(MAT_DIALOG_DATA);

  protected currentUser: User | null = null;
  protected notifications: UserNotification[] = [];
  protected loading = true;

  constructor(private router: Router) {
    this.userService.getProfile().subscribe({
      next: (data: any) => {
        this.currentUser = data?.user ?? data;
        this.load();
      },
      error: (err) => {
        console.error('--Error ao identificar o usuário: ', err);
        this.loading = false;
        this.cdr.markForCheck();
        
        if (err.status === 401)
          this.router.navigate(['/login']);
      },
    });
  }

  private load(): void {
    if (!this.currentUser?.id) {
      this.loading = false;
      this.cdr.markForCheck();
      return;
    }

    this.loading = true;

    this.notificationService.findByUser(this.currentUser.id).subscribe({
      next: (notifications) => {
        this.notifications = notifications;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('--Error ao carregar notificações: ', err);
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  protected get unreadCount(): number {
    return this.notifications.filter((n) => !n.readed).length;
  }

  protected select(notification: UserNotification): void {
    if (!notification.readed)
      this.markAsRead(notification);

    if (notification.comment_id != null) {
      this.openThread(notification.comment_id);
      return;
    }

    this.dialogRef.close({
      status: DialogResultStatus.CONFIRMED,
      confirmed: true,
      data: { selected: notification },
    });
  }

  private openThread(commentId: number): void {
    this.dialog.open<CommentThreadDialogComponent, CommentThreadDialogConfig, DialogResult<void>>(
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
    );
  }

  private markAsRead(notification: UserNotification): void {
    notification.readed = true;

    this.notificationService.markAsRead(notification.id).subscribe({
      error: (err) => console.error('--Error ao marcar como lida: ', err),
    });
  }

  protected markAllAsRead(): void {
    if (!this.currentUser?.id || !this.unreadCount)
      return;

    for (const notification of this.notifications)
      notification.readed = true;

    this.notificationService.markAllAsRead(this.currentUser.id).subscribe({
      error: (err) => console.error('--Error ao marcar todas como lidas: ', err),
    });
  }

  protected remove(notification: UserNotification, event: MouseEvent): void {
    event.stopPropagation();

    this.notifications = this.notifications.filter((n) => n.id !== notification.id);

    this.notificationService.delete(notification.id).subscribe({
      error: (err) => {
        console.error('--Error ao excluir notificação: ', err);
        this.load();
      },
    });
  }

  protected timeAgo(date?: string): string {
    if (!date)
      return '';

    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60)
      return 'agora mesmo';

    const units: [Intl.RelativeTimeFormatUnit, number][] = [
      ['year', 31536000],
      ['month', 2592000],
      ['week', 604800],
      ['day', 86400],
      ['hour', 3600],
      ['minute', 60],
    ];

    const formatter = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' });

    for (const [unit, size] of units) {
      const amount = Math.floor(seconds / size);
      if (amount >= 1)
        return formatter.format(-amount, unit);
    }

    return 'agora mesmo';
  }

  protected close(): void {
    this.dialogRef.close({
      status: DialogResultStatus.CANCELLED,
      confirmed: false,
    });
  }
}