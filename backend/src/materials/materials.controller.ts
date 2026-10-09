import {
  Controller,
  Get,
  Post,
  Param,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { BaseController } from '../common/base/base.controller';
import { Material } from './materials.entity';
import { MaterialService } from './materials.service';

import { ImageUploadInterceptor } from '../common/upload/image-upload.interceptor';

@Controller('materials')
export class MaterialController extends BaseController<Material> {
  constructor(private readonly materialService: MaterialService) {
    super(materialService);
  }

  @Get('ordered')
  findOrdered() {
    return this.materialService.findOrdered();
  }

  @Get(':id/comments')
  findComments(@Param('id', ParseIntPipe) id: number) {
    return this.materialService.findComments(id);
  }

  @Post('upload')
  @UseInterceptors(ImageUploadInterceptor('main_image', 'materials'))
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    return {
      filename: file.filename,
      originalName: file.originalname,
      path: `/uploads/materials/${file.filename}`,
    };
  }

  @Get('findByURL/:url')
  findByURL(@Param('url') url: string) {
    return this.materialService.findByURL(url);
  }
}
