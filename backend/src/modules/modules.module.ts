import { Module as NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from './modules.entity';

@NestModule({
  imports: [TypeOrmModule.forFeature([Module])],
  controllers: [],
  providers: [],
  exports: [TypeOrmModule],
})
export class ModuleModule {}