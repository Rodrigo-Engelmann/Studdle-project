import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users.entity';

import { UpdateUserDto } from '../auth/dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  create(data: Partial<User>) {
    const user = this.userRepo.create(data);
    return this.userRepo.save(user);
  }

  findAll() {
    return this.userRepo.find();
  }

  async findById(id: number) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) 
      throw new NotFoundException(`Usuário #${id} não encontrado`);
    
    return user;
  }

  async update(id: number, data: Partial<User>) {
    await this.findById(id);
    await this.userRepo.update(id, data);
    return this.findById(id);
  }

  async remove(id: number) {
    await this.findById(id);
    await this.userRepo.delete(id);
    return { deleted: true };
  }

  // Retorna perfil público sem senha
  async getPublicProfile(id: number) {
    const user = await this.userRepo.findOne({
      where: { id },
      select: ['id', 'user_name', 'profile_picture', 'account_bio', 'xp', 'createdDate'],
    });
    if (!user) 
      throw new NotFoundException(`Usuário #${id} não encontrado`);

    return user;
  }

  // Progresso geral: módulo atual, xp, tasks e conteúdos concluídos
  async getProgress(id: number) {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: [
        'current_module',
        'user_tasks',
        'material_statuses',
        'video_statuses',
      ],
    });
    if (!user) throw new NotFoundException(`Usuário #${id} não encontrado`);
    return {
      xp: user.xp,
      current_module: user.current_module,
      tasks_completed: user.user_tasks?.filter((t) => t.completed).length ?? 0,
      tasks_total: user.user_tasks?.length ?? 0,
      materials_completed: user.material_statuses?.filter((m) => m.completed).length ?? 0,
      videos_completed: user.video_statuses?.filter((v) => v.completed).length ?? 0,
    };
  }

  async updateModule(id: number, moduleId: number) {
    await this.findById(id);
    await this.userRepo.update(id, { current_module_id: moduleId });
    return this.findById(id);
  }

  async getMaterials(id: number) {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: ['material_statuses', 'material_statuses.material'],
    });
    if (!user) 
      throw new NotFoundException(`Usuário #${id} não encontrado`);

    return user.material_statuses;
  }

  async getVideos(id: number) {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: ['video_statuses', 'video_statuses.video'],
    });
    if (!user) 
      throw new NotFoundException(`Usuário #${id} não encontrado`);

    return user.video_statuses;
  }

  async getTasks(id: number) {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: ['user_tasks', 'user_tasks.task'],
    });
    if (!user) 
      throw new NotFoundException(`Usuário #${id} não encontrado`);

    return user.user_tasks;
  }

  async getNotifications(id: number) {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: ['notifications'],
    });
    if (!user) 
      throw new NotFoundException(`Usuário #${id} não encontrado`);

    return user.notifications;
  }

  async updateNotificationSettings(
    id: number,
    data: {
      comments_notification_ceiling: boolean;
      comments_notification_ceiling_number: number;
    },
  ) {
    await this.findById(id);
    await this.userRepo.update(id, data);
    return this.findById(id);
  }

  async updateUser(
    id: number,
    data: Partial<UpdateUserDto>,
    file?: Express.Multer.File
  ) {
    // Usando o repositório correto
    const user = await this.userRepo.findOne({ where: { id } });

    if (!user)
        throw new NotFoundException('Usuário não encontrado');

    // Atualizar campos se existirem
    if (data.name) 
      user.user_name = data.name; // se no frontend está "name", aqui atualiza "user_name", é mais pra segurança mesmo

    if (data.email) 
      user.email = data.email;

    // Atualiza foto
    if (file)
        user.profile_picture = `/uploads/profile/${file.filename}`;

    // atualiza a opção de colorblindness
    if (data.colorblindness !== undefined)
      user.colorblindness = Number(data.colorblindness);

    return this.userRepo.save(user);
  }

  
  async deleteAccount(userId: number) {
    await this.userRepo.delete(userId);
    return { message: 'Conta deletada com sucesso' };
  }

  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
    });

    if (!user)
      throw new NotFoundException('Usuário não encontrado');

    const validPassword = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!validPassword)
      throw new UnauthorizedException('Senha atual incorreta');

    user.password = await bcrypt.hash(newPassword, 10);

    await this.userRepo.save(user);

    return {
      message: 'Senha alterada com sucesso.',
    };
  }
}