import './globals.css'; // optional – you can delete if you don't have this file

export const metadata = {
  title: 'Pet Log',
  description: 'Simple pet‑log app built with Next.js App Router',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* You can add <title>, meta tags, etc. */}
      </head>
      <body>{children}</body>
    </html>
  );
}
