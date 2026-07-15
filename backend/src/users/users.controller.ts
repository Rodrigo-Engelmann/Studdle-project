import { Controller, Get, Patch, Param, Body, ParseIntPipe, Delete, UseGuards, Req } from '@nestjs/common';
import { BaseController } from '../common/base/base.controller';
import { User } from './users.entity';
import { UserService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('users')
export class UserController extends BaseController<User> {
  constructor(private readonly userService: UserService) {
    super(userService);
  }

  // Retorna o perfil público de um usuário (sem senha)
  @Get(':id/profile')
  getPublicProfile(@Param('id', ParseIntPipe) id: number) {
    return this.userService.getPublicProfile(id);
  }

  // Retorna o progresso geral do usuário (módulo atual, xp, tasks concluídas)
  @Get(':id/progress')
  getProgress(@Param('id', ParseIntPipe) id: number) {
    return this.userService.getProgress(id);
  }

  // Atualiza o módulo atual do usuário
  @Patch(':id/module')
  updateModule(
    @Param('id', ParseIntPipe) id: number,
    @Body('module_id', ParseIntPipe) moduleId: number,
  ) {
    return this.userService.updateModule(id, moduleId);
  }

  // Retorna os materiais assistidos/lidos pelo usuário
  @Get(':id/materials')
  getMaterials(@Param('id', ParseIntPipe) id: number) {
    return this.userService.getMaterials(id);
  }

  // Retorna os vídeos assistidos pelo usuário
  @Get(':id/videos')
  getVideos(@Param('id', ParseIntPipe) id: number) {
    return this.userService.getVideos(id);
  }

  // Retorna as tasks do usuário com status de conclusão
  @Get(':id/tasks')
  getTasks(@Param('id', ParseIntPipe) id: number) {
    return this.userService.getTasks(id);
  }

  // Retorna as notificações do usuário
  @Get(':id/notifications')
  getNotifications(@Param('id', ParseIntPipe) id: number) {
    return this.userService.getNotifications(id);
  }

  // Atualiza preferências de notificação
  @Patch(':id/notifications/settings')
  updateNotificationSettings(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: { comments_notification_ceiling: boolean; comments_notification_ceiling_number: number },
  ) {
    return this.userService.updateNotificationSettings(id, data);
  }

  @Delete('delete')
  @UseGuards(JwtAuthGuard)
  async deleteAccount(@Req() req: any) {
    return this.userService.deleteAccount(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  async changePassword(
    @Req() req: any,
    @Body() body: {
      currentPassword: string;
      newPassword: string;
    },
  ) {
    return this.userService.changePassword(
      req.user.id,
      body.currentPassword,
      body.newPassword,
    );
  }
}