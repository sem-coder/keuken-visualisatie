import { NextResponse } from 'next/server';
import { getMockStorage } from '@/lib/storage/mock-storage';

export const runtime = 'nodejs';

export async function GET(
  _request: Request,
  context: { params: Promise<{ key: string[] }> },
) {
  const { key } = await context.params;
  const decodedKey = key.map(decodeURIComponent).join('/');
  const storage = getMockStorage();
  const entry = storage.getBuffer(decodedKey);

  if (!entry) {
    return NextResponse.json({ error: 'Bestand niet gevonden' }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(entry.buffer), {
    headers: {
      'Content-Type': entry.mimeType,
      'Cache-Control': 'private, no-store',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}
