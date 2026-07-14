'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import type { Order, Paginated, Patient, Test } from '@/lib/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { Table, Th, Tr, Td } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState, LoadingBlock } from '@/components/ui/DataStates';
import { formatDate, formatMoney } from '@/lib/utils';
import { cn } from '@/lib/utils';

const STATUS = ['', 'pending', 'approved', 'cancelled'];

export default function OrdersPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [open, setOpen] = useState(false);
  const [patientId, setPatientId] = useState('');
  const [selected, setSelected] = useState<number[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ['orders', page, status],
    queryFn: () => api<Paginated<Order>>(`/orders?page=${page}&limit=10${status ? `&status=${status}` : ''}`),
  });
  const patients = useQuery({ queryKey: ['patients-all'], queryFn: () => api<Paginated<Patient>>('/patients?limit=100') });
  const tests = useQuery({ queryKey: ['tests-all'], queryFn: () => api<Paginated<Test>>('/tests?limit=100') });

  const create = useMutation({
    mutationFn: () => api('/orders', { method: 'POST', body: { patientId: Number(patientId), testIds: selected } }),
    onSuccess: () => {
      toast.success('Order created');
      setOpen(false); setPatientId(''); setSelected([]);
      qc.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const act = useMutation({
    mutationFn: ({ id, action }: { id: number; action: 'approve' | 'cancel' }) => api(`/orders/${id}/${action}`, { method: 'PATCH' }),
    onSuccess: () => { toast.success('Order updated'); qc.invalidateQueries({ queryKey: ['orders'] }); },
    onError: (e: any) => toast.error(e.message),
  });

  function toggle(id: number) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  return (
    <div>
      <PageHeader
        title="Orders"
        subtitle="Create lab orders and track their approval."
        action={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> New order</Button>}
      />

      <div className="mb-4 flex gap-2">
        {STATUS.map((st) => (
          <button
            key={st || 'all'}
            onClick={() => { setStatus(st); setPage(1); }}
            className={cn('rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition-colors', status === st ? 'bg-brand-600 text-white' : 'bg-ink-100/60 text-ink-800 hover:bg-ink-100')}
          >
            {st || 'All'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="card"><LoadingBlock /></div>
      ) : data && data.data.length > 0 ? (
        <>
          <Table head={<><Th>Order</Th><Th>Patient</Th><Th>Tests</Th><Th>Status</Th><Th>Created</Th><Th className="text-right">Actions</Th></>}>
            {data.data.map((o) => {
              const items = o.requests?.flatMap((r) => r.items ?? []) ?? [];
              return (
                <Tr key={o.id}>
                  <Td className="font-mono text-xs">#{o.id}</Td>
                  <Td className="font-medium">{o.patient?.name ?? '—'}</Td>
                  <Td className="text-ink-800/70">{items.length} test{items.length !== 1 ? 's' : ''}</Td>
                  <Td><Badge status={o.status} /></Td>
                  <Td className="text-ink-800/60">{formatDate(o.createdAt)}</Td>
                  <Td className="text-right">
                    {o.status === 'pending' && (
                      <div className="flex justify-end gap-1">
                        <button onClick={() => act.mutate({ id: o.id, action: 'approve' })} className="rounded-lg p-2 text-emerald-600 hover:bg-emerald-50" title="Approve"><Check className="h-4 w-4" /></button>
                        <button onClick={() => act.mutate({ id: o.id, action: 'cancel' })} className="rounded-lg p-2 text-red-500 hover:bg-red-50" title="Cancel"><X className="h-4 w-4" /></button>
                      </div>
                    )}
                  </Td>
                </Tr>
              );
            })}
          </Table>
          <Pagination page={page} totalPages={data.meta.totalPages} onChange={setPage} />
        </>
      ) : (
        <div className="card"><EmptyState title="No orders" hint="Create an order to request tests for a patient." /></div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="New order"
        footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button loading={create.isPending} disabled={!patientId || selected.length === 0} onClick={() => create.mutate()}>Create order</Button></>}
      >
        <Select label="Patient" value={patientId} onChange={(e) => setPatientId(e.target.value)}>
          <option value="">Select a patient…</option>
          {patients.data?.data.map((p) => <option key={p.id} value={p.id}>{p.name} · {p.patientNumber}</option>)}
        </Select>

        <div>
          <p className="label">Tests</p>
          <div className="max-h-56 space-y-1.5 overflow-y-auto rounded-xl border border-ink-100 p-2">
            {tests.data?.data.map((t) => (
              <label key={t.id} className={cn('flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors', selected.includes(t.id) ? 'bg-brand-50 text-brand-700' : 'hover:bg-ink-50')}>
                <span className="flex items-center gap-2">
                  <input type="checkbox" checked={selected.includes(t.id)} onChange={() => toggle(t.id)} className="accent-brand-600" />
                  {t.name}
                </span>
                <span className="font-medium">{formatMoney(t.price)}</span>
              </label>
            ))}
          </div>
          <p className="mt-2 text-right text-sm text-ink-800/60">
            {selected.length} selected ·{' '}
            <span className="font-semibold text-ink-900">
              {formatMoney(tests.data?.data.filter((t) => selected.includes(t.id)).reduce((s, t) => s + Number(t.price), 0) ?? 0)}
            </span>
          </p>
        </div>
      </Modal>
    </div>
  );
}
