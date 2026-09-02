import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';

export function deleteUploadedFile(filePath?: string | null): void {
  if (!filePath)
    return;

  const relativePath = filePath.replace(/^\/+/, '');
  const fullPath = join(process.cwd(), relativePath);

  if (existsSync(fullPath))
    unlinkSync(fullPath);
}