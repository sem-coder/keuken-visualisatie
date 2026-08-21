import { randomUUID } from 'crypto';
import type { StorageProvider, StoredFile } from '@/lib/storage/storage-provider';

interface MemoryEntry {
  buffer: Buffer;
  mimeType: string;
}

const store = new Map<string, MemoryEntry>();

export class MockStorageProvider implements StorageProvider {
  async upload(
    buffer: Buffer,
    options: { mimeType: string; prefix?: string; filename?: string },
  ): Promise<StoredFile> {
    const key = `${options.prefix ?? 'file'}/${randomUUID()}${extensionForMime(options.mimeType)}`;
    store.set(key, { buffer, mimeType: options.mimeType });

    return {
      key,
      url: `/api/files/${key.split('/').map(encodeURIComponent).join('/')}`,
      mimeType: options.mimeType,
      size: buffer.length,
    };
  }

  async getUrl(key: string): Promise<string | null> {
    return store.has(key)
      ? `/api/files/${key.split('/').map(encodeURIComponent).join('/')}`
      : null;
  }

  getBuffer(key: string): { buffer: Buffer; mimeType: string } | null {
    const entry = store.get(key);
    return entry ?? null;
  }
}

function extensionForMime(mimeType: string): string {
  switch (mimeType) {
    case 'image/jpeg':
    case 'image/jpg':
      return '.jpg';
    case 'image/png':
      return '.png';
    case 'image/webp':
      return '.webp';
    default:
      return '.bin';
  }
}

let singleton: MockStorageProvider | null = null;

export function getMockStorage(): MockStorageProvider {
  if (!singleton) {
    singleton = new MockStorageProvider();
  }
  return singleton;
}
