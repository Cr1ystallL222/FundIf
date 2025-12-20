export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex flex-col antialiased">
      {children}
    </main>
  );
}