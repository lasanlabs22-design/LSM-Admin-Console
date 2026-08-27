import Nav from '@/components/Nav';

export default function ConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <Nav />
      <main className="lg:pl-60 relative z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-24 lg:pb-10">
          {children}
        </div>
      </main>
    </div>
  );
}