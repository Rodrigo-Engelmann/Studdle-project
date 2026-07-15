import { Controller, Get, Delete, Param, ParseIntPipe } from '@nestjs/common';
import { BaseController } from '../common/base/base.controller';
import { Comment } from './comments.entity';
import { CommentService } from './comments.service';

@Controller('comments')
export class CommentController extends BaseController<Comment> {
  constructor(private readonly commentService: CommentService) {
    super(commentService);
  }

  // Retorna as respostas (replies) de um comentário
  @Get(':id/replies')
  findReplies(@Param('id', ParseIntPipe) id: number) {
    return this.commentService.findReplies(id);
  }

  // Retorna todos os comentários de um usuário
  @Get('user/:userId')
  findByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.commentService.findByUser(userId);
  }

  // Remove todos os comentários de um usuário (moderação)
  @Delete('user/:userId')
  removeByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.commentService.removeByUser(userId);
  }
}