import { mixin, Type } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { createMulterConfig } from './multer.config';

export function ImageUploadInterceptor( fieldName: string, folder: string ): Type<any> {
  return mixin (
    FileInterceptor( fieldName, createMulterConfig(folder) ),
  );
}