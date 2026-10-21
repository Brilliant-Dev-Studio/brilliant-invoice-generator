"use client";
import { Button } from "@/components/ui/button";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="empty-state">
      <h1>Something didn&apos;t go as planned.</h1>
      <p>Your saved work is safe. Please try again.</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
