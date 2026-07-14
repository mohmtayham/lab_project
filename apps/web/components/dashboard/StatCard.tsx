'use client';

import { useEffect, useRef } from 'react';
import { animate, motion, useInView } from 'framer-motion';
import { type LucideIcon } from 'lucide-react';
import { fadeUp } from '@/components/motion';

function Counter({ to, prefix = '' }: { to: number; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView || !ref.current) return;
    const controls = animate(0, to, {
      duration: 1.1,
      ease: 'easeOut',
      onUpdate(v) {
        if (ref.current) ref.current.textContent = prefix + Math.round(v).toLocaleString();
      },
    });
    return () => controls.stop();
  }, [inView, to, prefix]);

  return <span ref={ref}>{prefix}0</span>;
}

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  tone: string;
  prefix?: string;
}

export function StatCard({ label, value, icon: Icon, tone, prefix }: StatCardProps) {
  return (
    <motion.div variants={fadeUp} whileHover={{ y: -4 }} className="card group relative overflow-hidden p-5">
      <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-10 blur-2xl transition-opacity group-hover:opacity-20 ${tone}`} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-ink-800/60">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight">
            <Counter to={value} prefix={prefix} />
          </p>
        </div>
        <div className={`grid h-11 w-11 place-items-center rounded-xl text-white ${tone}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  );
}
