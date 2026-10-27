import {
  Controller,
  Get,
  Post,
  Param,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Req,
} from '@nestjs/common';
import { BaseController } from '../common/base/base.controller';
import { Material } from './materials.entity';
import { MaterialService } from './materials.service';

import { ImageUploadInterceptor } from '../common/upload/image-upload.interceptor';

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UserService } from '../users/users.service';

@Controller('materials')
export class MaterialController extends BaseController<Material> {
  constructor(
    private readonly materialService: MaterialService,
    private readonly userService: UserService,
  ) {
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

  @UseGuards(JwtAuthGuard)
  @Get('next')
  async getNextMaterials(@Req() req: any) {
    const userId = req.user.id;
    const user = await this.userService.findById(userId);

    if (!user.current_module_id) {
      return [];
    }

    return this.materialService.getNextMaterials(
      userId,
      user.current_module_id,
    );
  }

  // GET /materials/module/:moduleId
  @UseGuards(JwtAuthGuard)
  @Get('module/:moduleId')
  findByModule(
    @Req() req: any,
    @Param('moduleId', ParseIntPipe) moduleId: number,
  ) {
    return this.materialService.findByModule(req.user.id, moduleId);
  }
}
