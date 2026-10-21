import Link from "next/link";
export default function NotFound() {
  return (
    <div className="empty-state">
      <h1>Page not found.</h1>
      <p>This page may have moved, or it isn&apos;t part of your workspace.</p>
      <Link className="button button-primary" href="/dashboard">
        Back to dashboard
      </Link>
    </div>
  );
}
