import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin/auth-server';
import { getAdminStats } from '@/lib/analytics/store';

export const runtime = 'nodejs';

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 });
  }

  const stats = await getAdminStats();
  return NextResponse.json(stats);
}
