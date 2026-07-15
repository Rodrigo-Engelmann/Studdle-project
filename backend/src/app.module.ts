import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

// auth module
import { AuthModule } from './auth/auth.module';

import { ModuleModule } from './modules/modules.module';
import { UserModule } from './users/users.module';
import { MaterialModule } from './materials/materials.module';
import { VideoModule } from './videos/videos.module';
import { TaskModule } from './tasks/tasks.module';
import { MaterialStatusModule } from './materialstatus/materialstatus.module';
import { VideoStatusModule } from './videostatus/videostatus.module';
import { CommentModule } from './comments/comments.module';
import { TaskContentModule } from './task_contents/task_contents.module';
import { UserTaskModule } from './user_tasks/user_tasks.module';
import { QuizModule } from './quizzes/quizzes.module';
import { UserNotificationModule } from './user_notifications/user_notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 3306),
        username: config.get<string>('DB_USER', 'root'),
        password: config.get<string>('DB_PASS', 'root'),
        database: config.get<string>('DB_NAME', 'Studdle'),
        autoLoadEntities: true,
        synchronize: false, // nunca true em "produção", já que ele recarrega as tabelas.
      }),
      inject: [ConfigService],
    }),

    ModuleModule,
    UserModule,
    MaterialModule,
    VideoModule,
    TaskModule,
    MaterialStatusModule,
    VideoStatusModule,
    CommentModule,
    TaskContentModule,
    UserTaskModule,
    QuizModule,
    UserNotificationModule,
    AuthModule,
  ],
})
export class AppModule {}