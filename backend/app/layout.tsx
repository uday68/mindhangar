import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MindHangar Backend API',
  description: 'Production-ready authentication and API backend for MindHangar AI for Bharat',
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
