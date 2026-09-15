import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { get, put } from '@vercel/blob';

function isBlobStorageEnabled(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function getLocalPath(relativePath: string): string {
  if (process.env.TENANT_STORE_PATH) {
    return path.join(process.env.TENANT_STORE_PATH, relativePath);
  }
  return path.join(process.cwd(), 'data', 'tenants', relativePath);
}

async function readLocalJson<T>(relativePath: string, fallback: T): Promise<T> {
  try {
    const raw = await readFile(getLocalPath(relativePath), 'utf8');
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeLocalJson<T>(relativePath: string, data: T): Promise<void> {
  const filePath = getLocalPath(relativePath);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

async function readBlobJson<T>(blobPath: string, fallback: T): Promise<T> {
  try {
    const result = await get(blobPath, { access: 'private', useCache: false });
    if (!result || result.statusCode === 304 || !result.stream) {
      return fallback;
    }
    const raw = await new Response(result.stream).text();
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeBlobJson<T>(blobPath: string, data: T): Promise<void> {
  await put(blobPath, JSON.stringify(data, null, 2), {
    access: 'private',
    allowOverwrite: true,
    contentType: 'application/json',
  });
}

export async function readTenantJson<T>(relativePath: string, fallback: T): Promise<T> {
  const blobPath = `tenants/${relativePath}`;
  if (isBlobStorageEnabled()) {
    return readBlobJson(blobPath, fallback);
  }
  return readLocalJson(relativePath, fallback);
}

export async function writeTenantJson<T>(relativePath: string, data: T): Promise<void> {
  const blobPath = `tenants/${relativePath}`;
  if (isBlobStorageEnabled()) {
    await writeBlobJson(blobPath, data);
    return;
  }
  await writeLocalJson(relativePath, data);
}
