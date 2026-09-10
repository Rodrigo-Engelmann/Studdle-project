import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';

import { Module as ModuleEntity } from './modules.entity';
import { ModuleController } from './modules.controller';
import { ModuleService } from './modules.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ModuleEntity
    ]),
    HttpModule
  ],
  controllers: [
    ModuleController
  ],
  providers: [
    ModuleService
  ],
  exports: [
    ModuleService
  ],
})
export class ModuleModule {}