// components/common/ComingSoon.tsx
import { Sparkles } from "lucide-react";

export function ComingSoon({
  title,
  subtitle = "This section is under construction.",
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-gold/40 bg-[var(--accent)]">
        <Sparkles className="h-7 w-7 text-gold" />
      </div>
      <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-gold">
        Coming Soon
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h1>
      <div className="gold-rule mx-auto mt-4 h-px w-24" />
      <p className="mt-4 text-sm text-muted-foreground">{subtitle}</p>
    </div>
  );
}
