'use client';

import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Users, ClipboardList, FlaskConical, FileBarChart, DollarSign, Cpu } from 'lucide-react';
import { api } from '@/lib/api';
import type { DashboardStats } from '@/lib/types';
import { StatCard } from '@/components/dashboard/StatCard';
import { OrdersTrendChart, ResultsDonut } from '@/components/dashboard/Charts';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingBlock } from '@/components/ui/DataStates';
import { staggerContainer, fadeUp } from '@/components/motion';
import { formatDateTime } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

export default function DashboardPage() {
  const stats = useQuery({ queryKey: ['dash-stats'], queryFn: () => api<DashboardStats>('/dashboard/stats') });
  const trend = useQuery({ queryKey: ['dash-trend'], queryFn: () => api<{ date: string; count: number }[]>('/dashboard/orders-trend') });
  const byStatus = useQuery({ queryKey: ['dash-status'], queryFn: () => api<{ status: string; count: number }[]>('/dashboard/results-by-status') });
  const activity = useQuery({ queryKey: ['dash-activity'], queryFn: () => api<any>('/dashboard/recent-activity') });

  const s = stats.data;

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="A live overview of your laboratory operations." />

      {/* Stat cards */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
      >
        {s ? (
          <>
            <StatCard label="Patients" value={s.patients} icon={Users} tone="bg-brand-600" />
            <StatCard label="Pending orders" value={s.pendingOrders} icon={ClipboardList} tone="bg-amber-500" />
            <StatCard label="Requests in progress" value={s.inProgressRequests} icon={FlaskConical} tone="bg-violet-500" />
            <StatCard label="Results awaiting sign-off" value={s.pendingResults} icon={FileBarChart} tone="bg-rose-500" />
            <StatCard label="Revenue (paid)" value={s.revenue} prefix="$" icon={DollarSign} tone="bg-emerald-500" />
            <StatCard label="Active devices" value={s.activeDevices} icon={Cpu} tone="bg-cyan-600" />
          </>
        ) : (
          Array.from({ length: 6 }).map((_, i) => <div key={i} className="card h-28 animate-pulse" />)
        )}
      </motion.div>

      {/* Charts */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="card p-5 lg:col-span-2">
          <h3 className="mb-4 font-semibold">Orders this week</h3>
          {trend.data ? <OrdersTrendChart data={trend.data} /> : <LoadingBlock rows={3} />}
        </motion.div>
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="card p-5">
          <h3 className="mb-4 font-semibold">Results by status</h3>
          {byStatus.data ? <ResultsDonut data={byStatus.data} /> : <LoadingBlock rows={3} />}
        </motion.div>
      </div>

      {/* Recent activity */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="card p-5">
          <h3 className="mb-3 font-semibold">Latest orders</h3>
          <div className="divide-y divide-ink-100/70">
            {activity.data?.orders?.map((o: any) => (
              <div key={o.id} className="flex items-center justify-between py-2.5">
                <div>
                  <p className="text-sm font-medium">#{o.id} · {o.patient?.name ?? 'Patient'}</p>
                  <p className="text-[11px] text-ink-800/50">{formatDateTime(o.createdAt)}</p>
                </div>
                <Badge status={o.status} />
              </div>
            )) ?? <LoadingBlock rows={3} />}
          </div>
        </motion.div>
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="card p-5">
          <h3 className="mb-3 font-semibold">Latest results</h3>
          <div className="divide-y divide-ink-100/70">
            {activity.data?.results?.map((r: any) => (
              <div key={r.id} className="flex items-center justify-between py-2.5">
                <div>
                  <p className="text-sm font-medium">{r.requestItem?.test?.name ?? 'Test'}</p>
                  <p className="text-[11px] text-ink-800/50">Value: {r.value ?? '—'}</p>
                </div>
                <Badge status={r.status} />
              </div>
            )) ?? <LoadingBlock rows={3} />}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
