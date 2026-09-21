import Link from 'next/link';
import PoweredBy from '@/components/PoweredBy';

export default function NotFound() {
  return (
    <div className="relative z-10 min-h-dvh flex flex-col px-5">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div
          className="t-num text-[64px] font-semibold leading-none"
          style={{ color: 'var(--brand)' }}
        >
          404
        </div>
        <h1 className="t-title mt-4">This page doesn&apos;t exist</h1>
        <p className="t-body mt-1.5">
          The link may be old, or the item may have been removed.
        </p>
        <Link href="/" className="btn btn-primary mt-6">
          Back to the dashboard
        </Link>
      </div>

      <PoweredBy className="py-6 safe-bottom" />
    </div>
  );
}
