'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Keeps a console page current without anyone pressing refresh.
 *
 * Two triggers, because they cover different moments:
 *   - coming back to the tab, which is when someone is about to look
 *   - a slow poll, for a screen left open and watched
 *
 * Both skip when the tab is hidden, so a forgotten window costs nothing.
 */
export default function AutoRefresh({ seconds = 60 }: { seconds?: number }) {
  const router = useRouter();

  useEffect(() => {
    const refreshIfVisible = () => {
      if (document.visibilityState === 'visible') {
        router.refresh();
      }
    };

    // The moment they switch back to this tab
    window.addEventListener('focus', refreshIfVisible);
    document.addEventListener('visibilitychange', refreshIfVisible);

    // And a quiet tick for a screen nobody has left
    const tick = setInterval(refreshIfVisible, seconds * 1000);

    return () => {
      window.removeEventListener('focus', refreshIfVisible);
      document.removeEventListener('visibilitychange', refreshIfVisible);
      clearInterval(tick);
    };
  }, [router, seconds]);

  return null;
}
