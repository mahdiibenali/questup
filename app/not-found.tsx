import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-6xl font-display font-bold text-primary mb-4">404</h1>
        <p className="text-text-muted mb-6">Page not found</p>
        <Link
          href="/"
          className="px-6 py-3 bg-primary hover:bg-primary-hover text-white font-semibold rounded-card transition-colors inline-block"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
