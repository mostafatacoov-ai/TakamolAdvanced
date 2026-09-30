import "./globals.css";

export default function NotFound() {
  return (
    <html lang="en">
      <body>
        <div className="flex h-screen w-screen flex-col items-center justify-center gap-4 bg-navy text-white">
          <span className="glow-title font-exo text-[64px] font-bold leading-none text-teal-cyan">404</span>
          <h1 className="text-2xl font-bold">Page not found</h1>
          <div className="glow-bar h-[3px] w-24 rounded-full bg-teal" />
          <a
            href="/"
            className="mt-4 rounded-full border-2 border-teal px-8 py-3 font-bold text-white transition-colors hover:bg-teal hover:text-navy"
          >
            Back to home
          </a>
        </div>
      </body>
    </html>
  );
}
