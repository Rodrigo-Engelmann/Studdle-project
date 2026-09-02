import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import { existsSync, mkdirSync } from 'fs';

export function createMulterConfig(folder: string) {
  const uploadPath = `./uploads/${folder}`;
  if (!existsSync(uploadPath))
    mkdirSync(uploadPath, { recursive: true });

  return {
    storage: diskStorage({
      destination: uploadPath,
      filename: (_req, file, callback) => {
        const extension = extname(file.originalname);

        callback(
          null,
          `${randomUUID()}${extension}`,
        );
      },
    }),

    fileFilter: (_req: any, file: Express.Multer.File, callback: Function) => {
      if (!file.mimetype.startsWith('image/')) {
        return callback(
          new BadRequestException('Apenas imagens são permitidas.'),
          false,
        );
      }

      callback(null, true);
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5 MB
    },
  };
}