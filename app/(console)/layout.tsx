import Nav from '@/components/Nav';
import PoweredBy from '@/components/PoweredBy';

export default function ConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <Nav />
      <main className="lg:pl-60 relative z-10">
        {/* Bottom padding clears the phone tab bar and the home indicator */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-[calc(6rem+env(safe-area-inset-bottom))] lg:pb-8 min-h-screen flex flex-col">
          <div className="flex-1">{children}</div>
          <PoweredBy className="pt-12" />
        </div>
      </main>
    </div>
  );
}
