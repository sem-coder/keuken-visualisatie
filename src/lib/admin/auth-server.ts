import { cookies } from 'next/headers';
import { verifyAdminSessionToken } from '@/lib/admin/auth';

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get('kv_admin_session')?.value;
  return verifyAdminSessionToken(token);
}
