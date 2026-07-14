'use client';

import { cn } from '@/lib/utils';

/** Maps every domain status to a colour scheme. */
const TONE: Record<string, string> = {
  // generic
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-600',
  rejected: 'bg-red-100 text-red-600',
  completed: 'bg-emerald-100 text-emerald-700',
  in_progress: 'bg-brand-100 text-brand-700',
  // results
  entered: 'bg-brand-100 text-brand-700',
  reviewed: 'bg-violet-100 text-violet-700',
  // samples
  collected: 'bg-brand-100 text-brand-700',
  in_lab: 'bg-violet-100 text-violet-700',
  processed: 'bg-emerald-100 text-emerald-700',
  in_analysis: 'bg-violet-100 text-violet-700',
  sampled: 'bg-brand-100 text-brand-700',
  // devices
  active: 'bg-emerald-100 text-emerald-700',
  maintenance: 'bg-amber-100 text-amber-700',
  offline: 'bg-ink-100 text-ink-800',
  // payments
  paid: 'bg-emerald-100 text-emerald-700',
  refunded: 'bg-violet-100 text-violet-700',
};

export function Badge({ status, className }: { status: string; className?: string }) {
  const tone = TONE[status] ?? 'bg-ink-100 text-ink-800';
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold capitalize',
        tone,
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {status.replace(/_/g, ' ')}
    </span>
  );
}
