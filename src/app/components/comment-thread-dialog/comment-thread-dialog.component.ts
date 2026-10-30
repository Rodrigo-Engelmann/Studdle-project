// angular
import {
  ChangeDetectionStrategy
  , ChangeDetectorRef
  , Component
  , inject
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

// components
import { UserAvatarComponent } from '../user-avatar/user-avatar.component';

// services
import { Comment, CommentService } from '../../services/comments/comments.service';
import { User, UserService } from '../../services/users/users.service';

// common
import { DialogResultStatus } from '../enums/dialog.enums';
import { DialogResult } from '../models/dialog.models';
import { CommentThreadDialogConfig } from '../../models/notification.module';
import {
  MentionMaps
  , buildMentionMaps
  , decodeMentions
  , encodeMentions
} from '../../utils/mentions.util';

interface ThreadComment extends Comment {
  display: string;
  isTarget: boolean;
  isMine: boolean;
}

@Component({
  selector: 'app-comment-thread-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule
    , MatDialogModule
    , MatButtonModule
    , MatIconModule
    , UserAvatarComponent
  ],
  templateUrl: './comment-thread-dialog.component.html',
  styleUrls: ['./comment-thread-dialog.component.scss']
})
export class CommentThreadDialogComponent {
  private readonly dialogRef =
    inject<MatDialogRef<CommentThreadDialogComponent, DialogResult<void>>>(MatDialogRef);

  private readonly commentService = inject(CommentService);
  private readonly userService = inject(UserService);
  private readonly cdr = inject(ChangeDetectorRef);

  protected readonly config: CommentThreadDialogConfig = inject(MAT_DIALOG_DATA);

  protected currentUser: User | null = null;
  protected root: ThreadComment | null = null;
  protected replies: ThreadComment[] = [];
  protected loading = true;
  protected missing = false;

  protected replyDraft = '';
  protected sending = false;

  private maps: MentionMaps = buildMentionMaps([]);
  private targetAuthor: { id?: number; name?: string } = {};

  constructor(private router: Router) {
    this.userService.getProfile().subscribe({
      next: (data: any) => {
        this.currentUser = data?.user ?? data;
        if (this.currentUser && !this.currentUser.profile_picture && data?.profile_picture)
          this.currentUser.profile_picture = data.profile_picture;

        this.userService.updateColorScheme(data.user.color_scheme??1);
        this.load();
      },
      error: (err) => {
        this.currentUser = null;
        this.load();

        if (err.status === 401)
          this.router.navigate(['/login']);
      },
    });
  }

  private load(): void {
    this.loading = true;

    this.commentService.findContext(this.config.commentId).subscribe({
      next: (context: any) => {
        const all = [context.root, ...context.replies];
        this.maps = buildMentionMaps(all, this.currentUser);

        this.root = this.toThreadComment(context.root, context.target.id);
        this.replies = context.replies.map((reply: any) =>
          this.toThreadComment(reply, context.target.id),
        );

        this.targetAuthor = {
          id: context.target.user?.id,
          name: context.target.user?.user_name,
        };

        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('--Error ao carregar a conversa: ', err);
        this.missing = true;
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  private toThreadComment(comment: Comment, targetId: number): ThreadComment {
    return {
      ...comment,
      display: decodeMentions(comment.content, this.maps),
      isTarget: comment.id === targetId,
      isMine: !!this.currentUser && comment.user_id === this.currentUser.id,
    };
  }

  protected prefillMention(): void {
    if (!this.replyDraft && this.targetAuthor.name)
      this.replyDraft = `@${this.targetAuthor.name} `;
  }

  protected submitReply(): void {
    const content = this.replyDraft.trim();
    if (!content || !this.currentUser || !this.root || this.sending)
      return;

    this.sending = true;

    const payload: Partial<Comment> = {
      content: encodeMentions(content, this.maps),
      user_id: this.currentUser.id!,
      mentions_comment: this.root.id,
      ...(this.root.video_id != null
        ? { video_id: this.root.video_id }
        : { material_id: this.root.material_id }),
    };

    this.commentService.create(payload).subscribe({
      next: () => {
        this.sending = false;
        this.replyDraft = '';
        this.load();
      },
      error: (err) => {
        console.error('--Error ao responder: ', err);
        this.sending = false;
        this.cdr.markForCheck();
      },
    });
  }

  protected autoGrow(event: Event): void {
    const el = event.target as HTMLTextAreaElement;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
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
      status: DialogResultStatus.CONFIRMED,
      confirmed: true,
    });
  }
}