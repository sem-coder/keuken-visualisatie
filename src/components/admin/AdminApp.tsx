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
    <div className="space-y-8">
      <nav
        className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm"
        aria-label="Admin secties"
      >
        <Button
          type="button"
          variant={tab === 'stats' ? 'primary' : 'ghost'}
          size="sm"
          className={tab === 'stats' ? 'shadow-sm' : 'text-slate-600'}
          onClick={() => setTab('stats')}
        >
          Gebruik & kosten
        </Button>
        <Button
          type="button"
          variant={tab === 'clients' ? 'primary' : 'ghost'}
          size="sm"
          className={tab === 'clients' ? 'shadow-sm' : 'text-slate-600'}
          onClick={() => setTab('clients')}
        >
          Klanten
        </Button>
      </nav>

      {tab === 'stats' ? <AdminDashboard /> : <AdminClients />}
    </div>
  );
}
