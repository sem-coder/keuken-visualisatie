export default function EmbedLayout({ children }: { children: React.ReactNode }) {
  return <div data-kv-embed-root>{children}</div>;
}
