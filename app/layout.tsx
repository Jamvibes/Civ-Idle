import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'Civ Idle — The first chapter',
  description:
    'An interconnected civilization idle game. Assign workers, grow a settlement, and discover technologies at the dawn of civilization.',
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
