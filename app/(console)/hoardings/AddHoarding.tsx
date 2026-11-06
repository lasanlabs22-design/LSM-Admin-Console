'use client';

import { useState } from 'react';
import HoardingForm from './HoardingForm';

export default function AddHoarding() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn btn-primary shrink-0">
        + Add hoarding
      </button>
      {open && <HoardingForm onClose={() => setOpen(false)} />}
    </>
  );
}
