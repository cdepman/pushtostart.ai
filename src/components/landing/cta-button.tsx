"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { ArrowRight, LayoutDashboard } from "lucide-react";

export function CtaButton({
  label = "Get Started",
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <Link
          href="/new"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:opacity-90"
        >
          {label}
          <ArrowRight size={16} />
        </Link>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-xl border border-border px-6 py-3 text-sm font-medium transition-colors hover:bg-muted"
        >
          <LayoutDashboard size={16} />
          Dashboard
        </Link>
      </div>
    );
  }

  return (
    <Link
      href="/sign-up"
      className={`inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:opacity-90 ${className}`}
    >
      {label}
      <ArrowRight size={16} />
    </Link>
  );
}
