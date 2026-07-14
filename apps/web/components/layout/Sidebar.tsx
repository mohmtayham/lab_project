'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { FlaskConical } from 'lucide-react';
import { NAV_ITEMS } from '@/lib/nav';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const items = NAV_ITEMS.filter(
    (item) => !item.permission || user?.permissions?.includes(item.permission),
  );

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-ink-100 bg-white/80 backdrop-blur lg:flex">
      <div className="flex items-center gap-2.5 px-6 py-6">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 text-white shadow-glow">
          <FlaskConical className="h-5 w-5" />
        </div>
        <div>
          <p className="text-base font-bold leading-tight">LabSphere</p>
          <p className="text-[11px] uppercase tracking-wider text-ink-800/40">Lab Information</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors',
                active ? 'text-brand-700' : 'text-ink-800/70 hover:bg-ink-50 hover:text-ink-900',
              )}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl bg-brand-50"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <Icon className="relative z-10 h-[18px] w-[18px]" />
              <span className="relative z-10">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-6 py-4 text-[11px] text-ink-800/40">v1.0 · © LabSphere</div>
    </aside>
  );
}
