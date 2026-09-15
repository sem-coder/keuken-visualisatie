'use client';

import { useEffect, useState } from 'react';
import { PortalDashboard } from '@/components/portal/PortalDashboard';
import { PortalForgotPassword } from '@/components/portal/PortalForgotPassword';
import { PortalLogin } from '@/components/portal/PortalLogin';
import { PortalRegister } from '@/components/portal/PortalRegister';
import { PortalResetPassword } from '@/components/portal/PortalResetPassword';

type AuthView = 'login' | 'register' | 'forgot' | 'reset';

export function PortalApp() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [view, setView] = useState<AuthView>('login');
  const [resetToken, setResetToken] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('reset')?.trim();
    if (token) {
      setResetToken(token);
      setView('reset');
      window.history.replaceState({}, '', '/portal');
    }
  }, []);

  useEffect(() => {
    fetch('/api/portal/leads')
      .then((response) => setAuthenticated(response.ok))
      .catch(() => setAuthenticated(false));
  }, []);

  if (authenticated === null) {
    return <p className="text-slate-600">Portaal laden...</p>;
  }

  if (!authenticated) {
    if (view === 'reset' && resetToken) {
      return (
        <PortalResetPassword
          token={resetToken}
          onSuccess={() => {
            setResetToken(null);
            setView('login');
          }}
          onSwitchToLogin={() => {
            setResetToken(null);
            setView('login');
          }}
        />
      );
    }

    if (view === 'forgot') {
      return <PortalForgotPassword onSwitchToLogin={() => setView('login')} />;
    }

    if (view === 'register') {
      return (
        <PortalRegister
          onSuccess={() => setAuthenticated(true)}
          onSwitchToLogin={() => setView('login')}
        />
      );
    }

    return (
      <PortalLogin
        onSuccess={() => setAuthenticated(true)}
        onSwitchToRegister={() => setView('register')}
        onSwitchToForgot={() => setView('forgot')}
      />
    );
  }

  return <PortalDashboard />;
}
