import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './comments.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,
  ) {}

  create(data: Partial<Comment>) {
    const comment = this.commentRepo.create(data);
    return this.commentRepo.save(comment);
  }

  findAll() {
    return this.commentRepo.find({ relations: ['user'] });
  }

  async findById(id: number) {
    const comment = await this.commentRepo.findOne({
      where: { id },
      relations: ['user', 'parent_comment'],
    });
    if (!comment) throw new NotFoundException(`Comentário #${id} não encontrado`);
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
}