import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';

import { Material } from './materials.entity';
import { MaterialController } from './materials.controller';
import { MaterialService } from './materials.service';
import { MaterialStatus } from '../materialstatus/materialstatus.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Material
      , MaterialStatus
    ]),
    HttpModule
  ],
  controllers: [
    MaterialController
  ],
  providers: [
    MaterialService
  ],
  exports: [
    MaterialService
  ],
})
export class MaterialModule {}