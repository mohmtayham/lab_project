'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { initials } from '@/lib/utils';
import { NotificationBell } from './NotificationBell';

export function Topbar() {
  const { user, logout } = useAuth();
  const [menu, setMenu] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-ink-100 bg-white/70 px-5 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-ink-800/50">
          Welcome back,{' '}
          <span className="font-semibold text-ink-900">{user?.name?.split(' ')[0] ?? 'User'}</span>
        </span>
      </div>

      <div className="flex items-center gap-2">
        <NotificationBell />

        <div className="relative">
          <button
            onClick={() => setMenu((m) => !m)}
            className="flex items-center gap-2 rounded-xl py-1.5 pl-1.5 pr-3 hover:bg-ink-100"
          >
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-bold text-white">
              {user ? initials(user.name) : '?'}
            </span>
            <div className="hidden text-left sm:block">
              <p className="text-sm font-semibold leading-tight">{user?.name}</p>
              <p className="text-[11px] text-ink-800/50">{user?.roles?.join(', ')}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-ink-800/40" />
          </button>

          <AnimatePresence>
            {menu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenu(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.97 }}
                  className="card absolute right-0 z-20 mt-2 w-52 p-1.5"
                >
                  <div className="border-b border-ink-100 px-3 py-2">
                    <p className="text-sm font-semibold">{user?.name}</p>
                    <p className="truncate text-[11px] text-ink-800/50">{user?.email}</p>
                  </div>
                  <button
                    onClick={logout}
                    className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
