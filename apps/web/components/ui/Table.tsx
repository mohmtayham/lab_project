'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { fadeUp, staggerContainer } from '@/components/motion';
import { cn } from '@/lib/utils';

export function Table({ head, children }: { head: ReactNode; children: ReactNode }) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-ink-50/80 text-left text-xs font-semibold uppercase tracking-wide text-ink-800/50">
            <tr>{head}</tr>
          </thead>
          <motion.tbody variants={staggerContainer} initial="hidden" animate="show">
            {children}
          </motion.tbody>
        </table>
      </div>
    </div>
  );
}

export function Th({ children, className }: { children?: ReactNode; className?: string }) {
  return <th className={cn('px-5 py-3.5', className)}>{children}</th>;
}

export function Tr({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <motion.tr
      variants={fadeUp}
      onClick={onClick}
      className={cn(
        'border-t border-ink-100/70 transition-colors hover:bg-brand-50/40',
        onClick && 'cursor-pointer',
      )}
    >
      {children}
    </motion.tr>
  );
}

export function Td({ children, className }: { children?: ReactNode; className?: string }) {
  return <td className={cn('px-5 py-3.5 align-middle', className)}>{children}</td>;
}
