export default function EmbedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-kv-embed-root className="kv-embed-root w-full min-w-0 max-w-full overflow-x-hidden">
      {children}
    </div>
  );
}
