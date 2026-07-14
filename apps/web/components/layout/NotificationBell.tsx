'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Notification } from '@/lib/types';
import { formatDateTime } from '@/lib/utils';

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api<Notification[]>('/notifications'),
    refetchInterval: 30_000,
  });

  const unread = notifications.filter((n) => !n.isRead).length;

  async function markAll() {
    await api('/notifications/read-all', { method: 'PATCH' });
    qc.invalidateQueries({ queryKey: ['notifications'] });
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative grid h-10 w-10 place-items-center rounded-xl text-ink-800/70 hover:bg-ink-100"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white"
          >
            {unread}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97 }}
              className="card absolute right-0 z-20 mt-2 w-80 overflow-hidden p-0"
            >
              <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
                <p className="text-sm font-semibold">Notifications</p>
                {unread > 0 && (
                  <button onClick={markAll} className="text-xs font-medium text-brand-600 hover:underline">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="px-4 py-8 text-center text-sm text-ink-800/50">You&apos;re all caught up 🎉</p>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className={`border-b border-ink-100/60 px-4 py-3 ${n.isRead ? 'opacity-60' : ''}`}>
                      <p className="text-sm">{n.message}</p>
                      <p className="mt-1 text-[11px] text-ink-800/40">{formatDateTime(n.createdAt)}</p>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
