import { put, del } from '@vercel/blob';
import fs from 'fs/promises';
import path from 'path';

const LOCAL_STORAGE_DIR = path.join(process.cwd(), 'public', 'uploads');

export async function uploadFile(
  fileName: string,
  buffer: Buffer,
  contentType: string
): Promise<{ url: string; path: string }> {
  // If BLOB_READ_WRITE_TOKEN environment variable is configured, use Vercel Blob
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const blob = await put(fileName, buffer, {
        access: 'public',
        contentType,
      });
      return { url: blob.url, path: blob.url };
    } catch (err) {
      console.warn('Vercel Blob upload error, using local fallback:', err);
    }
  }

  // Local filesystem fallback
  await fs.mkdir(LOCAL_STORAGE_DIR, { recursive: true });
  const safeName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  const filePath = path.join(LOCAL_STORAGE_DIR, safeName);
  await fs.writeFile(filePath, buffer);
  const publicUrl = `/uploads/${safeName}`;
  return { url: publicUrl, path: filePath };
}

export async function deleteFile(storagePath: string): Promise<void> {
  if (storagePath.startsWith('http://') || storagePath.startsWith('https://')) {
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        await del(storagePath);
        return;
      } catch (err) {
        console.warn('Vercel Blob delete error:', err);
      }
    }
  }

  try {
    if (storagePath.startsWith('/uploads/')) {
      const fullPath = path.join(process.cwd(), 'public', storagePath);
      await fs.unlink(fullPath);
    } else if (storagePath.includes(path.sep)) {
      await fs.unlink(storagePath);
    }
  } catch (err) {
    console.warn('Local file delete warning:', err);
  }
}
