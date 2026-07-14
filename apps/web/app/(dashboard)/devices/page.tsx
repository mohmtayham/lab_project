'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Cpu } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import type { Device } from '@/lib/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { EmptyState, LoadingBlock } from '@/components/ui/DataStates';
import { formatDate } from '@/lib/utils';
import { motion } from 'framer-motion';
import { staggerContainer, fadeUp } from '@/components/motion';

export default function DevicesPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', status: 'active', calibratedAt: '' });

  const { data, isLoading } = useQuery({ queryKey: ['devices-list'], queryFn: () => api<Device[]>('/devices') });

  const create = useMutation({
    mutationFn: () => api('/devices', { method: 'POST', body: { name: form.name, status: form.status, calibratedAt: form.calibratedAt || undefined } }),
    onSuccess: () => { toast.success('Device added'); setOpen(false); setForm({ name: '', status: 'active', calibratedAt: '' }); qc.invalidateQueries({ queryKey: ['devices-list'] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => api(`/devices/${id}`, { method: 'PATCH', body: { status } }),
    onSuccess: () => { toast.success('Updated'); qc.invalidateQueries({ queryKey: ['devices-list'] }); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div>
      <PageHeader title="Devices" subtitle="Analyzers and instruments in your lab." action={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> New device</Button>} />

      {isLoading ? (
        <LoadingBlock />
      ) : data && data.length > 0 ? (
        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((d) => (
            <motion.div key={d.id} variants={fadeUp} whileHover={{ y: -4 }} className="card p-5">
              <div className="flex items-start justify-between">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-cyan-100 text-cyan-700"><Cpu className="h-5 w-5" /></div>
                <Badge status={d.status} />
              </div>
              <p className="mt-3 font-semibold">{d.name}</p>
              <p className="text-xs text-ink-800/50">Calibrated {formatDate(d.calibratedAt)}</p>
              <Select value={d.status} onChange={(e) => setStatus.mutate({ id: d.id, status: e.target.value })} className="mt-3 !py-1.5 !text-xs">
                <option value="active">Active</option>
                <option value="maintenance">Maintenance</option>
                <option value="offline">Offline</option>
              </Select>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="card"><EmptyState title="No devices" hint="Add your first analyzer." /></div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Add device"
        footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button loading={create.isPending} onClick={() => create.mutate()}>Save</Button></>}>
        <Input label="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Sysmex XN-1000" />
        <div className="grid grid-cols-2 gap-3">
          <Select label="Status" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
            <option value="active">Active</option>
            <option value="maintenance">Maintenance</option>
            <option value="offline">Offline</option>
          </Select>
          <Input label="Calibrated at" type="date" value={form.calibratedAt} onChange={(e) => setForm((f) => ({ ...f, calibratedAt: e.target.value }))} />
        </div>
      </Modal>
    </div>
  );
}
