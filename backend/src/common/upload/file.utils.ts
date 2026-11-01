import { rmSync } from 'fs';
import { resolve } from 'path';

const UPLOADS_ROOT = resolve(process.cwd(), 'uploads');

export function deleteUploadedFile(filePath?: string | null): void {
  if (!filePath) return;

  const fullPath = resolve(process.cwd(), filePath.replace(/^\/+/, ''));

  // nunca apagar nada fora de ./uploads
  if (!fullPath.startsWith(UPLOADS_ROOT)) return;

  // force: true não lança se o arquivo não existir
  rmSync(fullPath, { force: true });
}
