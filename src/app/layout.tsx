// Pass-through root layout: <html>/<body> are rendered by [locale]/layout.tsx,
// and by not-found.tsx for requests that never reach a locale segment.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
