'use client';

import { motion } from 'framer-motion';
import { Inbox, Loader2 } from 'lucide-react';
import { ReactNode } from 'react';

export function Spinner({ className = 'h-6 w-6' }: { className?: string }) {
  return <Loader2 className={`animate-spin text-brand-500 ${className}`} />;
}

export function LoadingBlock({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="relative h-12 overflow-hidden rounded-xl bg-ink-100/70">
          <div className="animate-shimmer absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent" />
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center gap-3 py-16 text-center"
    >
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-500">
        <Inbox className="h-7 w-7" />
      </div>
      <div>
        <p className="font-semibold text-ink-900">{title}</p>
        {hint && <p className="mt-1 text-sm text-ink-800/60">{hint}</p>}
      </div>
      {action}
    </motion.div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-xl bg-red-50 px-4 py-8 text-center text-sm font-medium text-red-600">
      {message}
    </div>
  );
}
