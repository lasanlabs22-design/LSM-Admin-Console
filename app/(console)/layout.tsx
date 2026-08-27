import Nav from '@/components/Nav';

export default function ConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <Nav />
      <main className="max-w-6xl mx-auto px-4 py-6 pb-24 sm:pb-8">
        {children}
      </main>
    </div>
  );
}