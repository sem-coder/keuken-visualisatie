export default function EmbedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      data-kv-embed-root
      className="kv-embed-root mx-auto w-full min-w-0 max-w-6xl overflow-x-hidden px-1 py-0 sm:px-6 sm:py-2"
    >
      {children}
    </div>
  );
}
