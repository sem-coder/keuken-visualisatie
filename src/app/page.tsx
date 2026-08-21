import KitchenVisualizer from '@/components/KitchenVisualizer';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-100 via-white to-slate-50">
      <KitchenVisualizer />
      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        Keuken Visualisatie Tool · Woeler
      </footer>
    </main>
  );
}
