// angular
import {
  ChangeDetectionStrategy
  , ChangeDetectorRef
  , Component
  , Input
  , OnChanges
  , inject
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Router } from '@angular/router';

// components
import { UserAvatarComponent } from '../user-avatar/user-avatar.component';

// services
import { Comment, CommentService } from '../../services/comments/comments.service';
import { User, UserService } from '../../services/users/users.service';

interface CommentView extends Comment {
  display: string;
}

interface CommentNode extends CommentView {
  replies: CommentView[];
}

@Component({
  selector: 'app-comments',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule
    , MatButtonModule
    , MatIconModule
    , MatMenuModule
    , UserAvatarComponent
  ],
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss']
})
export class CommentsComponent implements OnChanges {
  @Input() videoId?: number;
  @Input() materialId?: number;

  private readonly commentService = inject(CommentService);
  private readonly userService = inject(UserService);
  private readonly cdr = inject(ChangeDetectorRef);

  protected currentUser: User | null = null;
  protected nodes: CommentNode[] = [];
  protected loading = true;
  protected total = 0;
  protected draft = '';
  protected composerFocused = false;
  protected sending = false;
  protected replyingTo: number | null = null;
  protected replyDraft = '';
  protected readonly expanded = new Set<number>();

  private readonly idByName = new Map<string, number>();
  private readonly nameById = new Map<number, string>();

  constructor(private router: Router) {
    this.userService.getProfile().subscribe({
      next: (data: any) => {
        this.currentUser = data?.user ?? data;
        if (this.currentUser && !this.currentUser.profile_picture && data?.profile_picture)
          this.currentUser.profile_picture = data.profile_picture;

        this.cdr.markForCheck();
      },
      error: (err) => {
        this.currentUser = null;
        this.cdr.markForCheck();

        if (err.status === 401)
          this.router.navigate(['/login']);
      },
    });
  }

  ngOnChanges(): void {
    this.load();
  }

  private load(): void {
    if (this.videoId == null && this.materialId == null)
      return;

    this.loading = true;
    const source = this.videoId != null
      ? this.commentService.findByVideo(this.videoId)
      : this.commentService.findByMaterial(this.materialId!);

    source.subscribe({
      next: (comments) => {
        this.nodes = this.buildTree(comments);
        this.total = comments.length;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('--Error ao carregar comentários: ', err);
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  private buildTree(comments: Comment[]): CommentNode[] {
    this.indexUsers(comments);

    const roots = new Map<number, CommentNode>();
    const orphans: CommentView[] = [];

    for (const comment of comments) {
      const view: CommentView = {
        ...comment,
        display: this.decodeMentions(comment.content),
      };

      if (!comment.mentions_comment)
        roots.set(comment.id!, { ...view, replies: [] });
      else
        orphans.push(view);
    }

    for (const reply of orphans)
      roots.get(reply.mentions_comment!)?.replies.push(reply);

    const sortAsc = (a: Comment, b: Comment) => this.time(a) - this.time(b);

    for (const node of roots.values())
      node.replies.sort(sortAsc);

    return [...roots.values()].sort((a, b) => this.time(b) - this.time(a));
  }

  private indexUsers(comments: Comment[]): void {
    this.idByName.clear();
    this.nameById.clear();

    const register = (id?: number, userName?: string) => {
      if (id == null || !userName)
        return;

      this.idByName.set(userName.toLowerCase(), id);
      this.nameById.set(id, userName);
    };

    for (const comment of comments)
      register(comment.user?.id, comment.user?.user_name);

    register(this.currentUser?.id, this.currentUser?.user_name);
  }

  private encodeMentions(text: string): string {
    let result = text;

    const names = [...this.idByName.keys()].sort((a, b) => b.length - a.length);

    for (const name of names) {
      const id = this.idByName.get(name)!;
      const pattern = new RegExp(`@${this.escapeRegex(name)}(?!\\w)`, 'gi');
      result = result.replace(pattern, `@[${id}]`);
    }

    return result;
  }

  private decodeMentions(content: string): string {
    return content.replace(
      /@\[(\d+)\]/g,
      (_, id: string) => `@${this.nameById.get(Number(id)) ?? 'usuário'}`,
    );
  }

  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private time(comment: Comment): number {
    return new Date(comment.publish_date ?? 0).getTime();
  }

  protected submit(): void {
    const content = this.draft.trim();
    if (!content || !this.currentUser || this.sending)
      return;

    this.send(content, null);
  }

  protected submitReply(rootId: number): void {
    const content = this.replyDraft.trim();
    if (!content || !this.currentUser || this.sending)
      return;

    this.send(content, rootId);
  }

  private send(content: string, mentionsComment: number | null): void {
    this.sending = true;

    const payload: Partial<Comment> = {
      content: this.encodeMentions(content),
      user_id: this.currentUser!.id!,
      ...(this.videoId != null ? { video_id: this.videoId } : { material_id: this.materialId! }),
      ...(mentionsComment != null && { mentions_comment: mentionsComment }),
    };

    this.commentService.create(payload).subscribe({
      next: () => {
        this.sending = false;
        this.clearDrafts();

        if (mentionsComment != null)
          this.expanded.add(mentionsComment);

        this.load();
      },
      error: (err) => {
        console.error('--Error ao publicar comentário: ', err);
        this.sending = false;
        this.cdr.markForCheck();
      },
    });
  }

  protected remove(comment: Comment): void {
    this.commentService.delete(comment.id!).subscribe({
      next: () => this.load(),
      error: (err) => console.error('--Error ao excluir comentário: ', err),
    });
  }

  protected cancel(): void {
    this.draft = '';
    this.composerFocused = false;
  }

  protected startReply(rootId: number, mentionName?: string): void {
    this.replyingTo = rootId;
    this.replyDraft = mentionName ? `@${mentionName} ` : '';
    this.expanded.add(rootId);
  }

  protected cancelReply(): void {
    this.replyingTo = null;
    this.replyDraft = '';
  }

  protected toggleReplies(rootId: number): void {
    if (this.expanded.has(rootId))
      this.expanded.delete(rootId);
    else
      this.expanded.add(rootId);
  }

  protected isExpanded(rootId: number): boolean {
    return this.expanded.has(rootId);
  }

  protected isOwn(comment: Comment): boolean {
    return !!this.currentUser && comment.user_id === this.currentUser.id;
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

  private clearDrafts(): void {
    this.draft = '';
    this.replyDraft = '';
    this.replyingTo = null;
    this.composerFocused = false;
  }
}
