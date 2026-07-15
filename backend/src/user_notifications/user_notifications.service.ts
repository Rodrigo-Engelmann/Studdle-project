import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserNotification } from './user_notifications.entity';

@Injectable()
export class UserNotificationService {
  constructor(
    @InjectRepository(UserNotification)
    private readonly notificationRepo: Repository<UserNotification>,
  ) {}

  create(data: Partial<UserNotification>) {
    const notification = this.notificationRepo.create(data);
    return this.notificationRepo.save(notification);
  }

  findAll() {
    return this.notificationRepo.find({ relations: ['user'] });
  }

  async findById(id: number) {
    const notification = await this.notificationRepo.findOne({ where: { id } });
    if (!notification) throw new NotFoundException(`Notificação #${id} não encontrada`);
    return notification;
  }

  async update(id: number, data: Partial<UserNotification>) {
    await this.findById(id);
    await this.notificationRepo.update(id, data);
    return this.findById(id);
  }

  async remove(id: number) {
    await this.findById(id);
    await this.notificationRepo.delete(id);
    return { deleted: true };
  }

  findByUser(userId: number) {
    return this.notificationRepo.find({
      where: { user_id: userId },
      order: { id: 'DESC' },
    });
  }

  findUnread(userId: number) {
    return this.notificationRepo.find({
      where: { user_id: userId, readed: false },
      order: { id: 'DESC' },
    });
  }

  async markAsRead(id: number) {
    await this.findById(id);
    await this.notificationRepo.update(id, { readed: true });
    return this.findById(id);
  }

  async markAllAsRead(userId: number) {
    await this.notificationRepo.update({ user_id: userId, readed: false }, { readed: true });
    return { updated: true };
  }

  async clearRead(userId: number) {
    await this.notificationRepo.delete({ user_id: userId, readed: true });
    return { deleted: true };
  }
}