import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';

import { Material } from './materials.entity';
import { MaterialController } from './materials.controller';
import { MaterialService } from './materials.service';

@Module({
  imports: [TypeOrmModule.forFeature([Material]), HttpModule],
  controllers: [MaterialController],
  providers: [MaterialService],
  exports: [MaterialService],
})
export class MaterialModule {}
