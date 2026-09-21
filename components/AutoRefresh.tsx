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
 * Both skip when the tab is hidden, so a forgotten window costs nothing,
 * and while someone is typing or has a pop-up open, so nothing shifts
 * under them mid-task.
 */
function isBusy() {
  const el = document.activeElement as HTMLElement | null;
  const typing =
    !!el &&
    (el.tagName === 'INPUT' ||
      el.tagName === 'TEXTAREA' ||
      el.tagName === 'SELECT' ||
      el.isContentEditable);

  return typing || !!document.querySelector('[aria-modal="true"]');
}

export default function AutoRefresh({ seconds = 60 }: { seconds?: number }) {
  const router = useRouter();

  useEffect(() => {
    const refreshIfVisible = () => {
      if (document.visibilityState === 'visible' && !isBusy()) {
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
