import { PortalApp } from '@/components/portal/PortalApp';

export const metadata = {
  title: 'Klantportaal | Keuken Visualisatie',
  robots: {
    index: false,
    follow: false,
  },
};

export default function PortalPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <PortalApp />
      </div>
    </main>
  );
}
