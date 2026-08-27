import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Lasan Mart Admin',
  description: 'Internal console',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#0E1017] text-white antialiased">{children}</body>
    </html>
  );
}