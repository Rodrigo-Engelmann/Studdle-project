import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaterialStatus } from './materialstatus.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MaterialStatus])],
  controllers: [],
  providers: [],
  exports: [TypeOrmModule],
})
export class MaterialStatusModule {}