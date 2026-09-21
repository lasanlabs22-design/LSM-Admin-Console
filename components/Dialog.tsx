'use client';

import { createPortal } from 'react-dom';
import { useDialog } from './useDialog';

/**
 * The console's one pop-up. Render it only while it should be open.
 *
 * - "confirm": a small centred box, for yes/no questions
 * - "panel": a large sheet that rises from the bottom on phones
 *
 * Escape, clicking the backdrop and the parent's own buttons all go
 * through onClose — so guard it there if closing mid-save would be wrong.
 */
export default function Dialog({
  onClose,
  label,
  size = 'confirm',
  children,
}: {
  onClose: () => void;
  /** Read out by screen readers when the dialog opens */
  label: string;
  size?: 'confirm' | 'panel';
  children: React.ReactNode;
}) {
  const ref = useDialog(true, onClose);
  const panel = size === 'panel';

  return createPortal(
    <div
      className={`fixed inset-0 z-[100] flex justify-center ${
        panel ? 'items-end sm:items-center sm:p-6' : 'items-center p-5'
      }`}
      style={{ background: 'rgba(0,0,0,0.62)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className={
          panel
            ? 'card w-full sm:max-w-2xl max-h-[92dvh] overflow-y-auto rounded-t-3xl sm:rounded-3xl outline-none safe-bottom'
            : 'card w-full max-w-md p-6 outline-none'
        }
        style={{ background: 'var(--bg-elevated)' }}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}
