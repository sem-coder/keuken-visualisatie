'use client';

import { useEffect, useState } from 'react';
import { AdminClients } from '@/components/admin/AdminClients';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { AdminLogin } from '@/components/admin/AdminLogin';
import { Button } from '@/components/ui/button';

type AdminTab = 'stats' | 'clients';

export function AdminApp() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [tab, setTab] = useState<AdminTab>('stats');

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((response) => setAuthenticated(response.ok))
      .catch(() => setAuthenticated(false));
  }, []);

  if (authenticated === null) {
    return <p className="text-slate-600">Admin laden...</p>;
  }

  if (!authenticated) {
    return <AdminLogin onSuccess={() => setAuthenticated(true)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={tab === 'stats' ? 'primary' : 'secondary'}
          onClick={() => setTab('stats')}
        >
          Gebruik & kosten
        </Button>
        <Button
          type="button"
          variant={tab === 'clients' ? 'primary' : 'secondary'}
          onClick={() => setTab('clients')}
        >
          Klanten
        </Button>
      </div>

      {tab === 'stats' ? <AdminDashboard /> : <AdminClients />}
    </div>
  );
}
