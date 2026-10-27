import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Comment } from './comments.entity';
import { UserNotificationService } from '../user_notifications/user_notifications.service';
import { NotificationType } from '../user_notifications/notification-type.enum';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,
    private readonly notificationService: UserNotificationService,
  ) {}

  async create(data: Partial<Comment>) {
    const saved = await this.commentRepo.save(this.commentRepo.create(data));

    // recarrega com o user para ter o nome do autor na notificação
    const full = await this.findById(saved.id);
    await this.notifyTargets(full);

    return full;
  }

  findAll() {
    return this.commentRepo.find({ relations: ['user'] });
  }

  async findById(id: number) {
    const comment = await this.commentRepo.findOne({
      where: { id },
      relations: ['user', 'parent_comment'],
    });
    if (!comment)
      throw new NotFoundException(`Comentário #${id} não encontrado`);

    return comment;
  }

  async update(id: number, data: Partial<Comment>) {
    await this.findById(id);
    await this.commentRepo.update(id, data);
    return this.findById(id);
  }

  async remove(id: number) {
    await this.findById(id);
    await this.commentRepo.delete(id);
    return { deleted: true };
  }

  async findReplies(id: number) {
    await this.findById(id);
    return this.commentRepo.find({
      where: { mentions_comment: id },
      relations: ['user'],
      order: { publish_date: 'ASC' },
    });
  }

  findByUser(userId: number) {
    return this.commentRepo.find({
      where: { user_id: userId },
      relations: ['video', 'material'],
      order: { publish_date: 'DESC' },
    });
  }

  async removeByUser(userId: number) {
    await this.commentRepo.delete({ user_id: userId });
    return { deleted: true };
  }

  findByVideo(videoId: number) {
    return this.commentRepo.find({
      where: { video_id: videoId },
      relations: ['user'],
      order: { publish_date: 'ASC' },
    });
  }

  findByMaterial(materialId: number) {
    return this.commentRepo.find({
      where: { material_id: materialId },
      relations: ['user'],
      order: { publish_date: 'ASC' },
    });
  }

  async findContext(id: number) {
    const target = await this.commentRepo.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!target)
      throw new NotFoundException(`Comentário #${id} não encontrado`);

    const rootId = target.mentions_comment ?? target.id;

    const root =
      rootId === target.id
        ? target
        : await this.commentRepo.findOne({
            where: { id: rootId },
            relations: ['user'],
          });

    const replies = await this.commentRepo.find({
      where: { mentions_comment: rootId },
      relations: ['user'],
      order: { publish_date: 'ASC' },
    });

    return { root: root ?? target, replies, target };
  }

  private async notifyTargets(comment: Comment): Promise<void> {
    const targets = new Set<number>();

    for (const match of comment.content.matchAll(/@\[(\d+)\]/g))
      targets.add(Number(match[1]));

    if (comment.mentions_comment) {
      const parent = await this.commentRepo.findOne({
        where: { id: comment.mentions_comment },
      });

      if (parent) targets.add(parent.user_id);
    }

    targets.delete(comment.user_id);
    if (!targets.size) return;

    const authorName = comment.user?.user_name ?? 'Alguém';

    const preview = comment.content
      .replace(/@\[\d+\]/g, '')
      .trim()
      .slice(0, 120);

    const pageLink = comment.material_id
      ? `/material/${comment.material_id}`
      : `/video/${comment.video_id}`;

    await Promise.all(
      [...targets].map((userId) =>
        this.notificationService.create({
          user_id: userId,
          type: NotificationType.COMMENT_REPLY,
          text: `${authorName} respondeu: "${preview}"`.slice(0, 255),
          comment_id: comment.id,
          page_link: pageLink,
          readed: false,
        }),
      ),
    );
  }
}
