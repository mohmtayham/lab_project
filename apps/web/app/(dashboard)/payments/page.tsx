'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, DollarSign, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import type { Order, Paginated, Payment } from '@/lib/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { Table, Th, Tr, Td } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState, LoadingBlock } from '@/components/ui/DataStates';
import { formatDate, formatMoney, cn } from '@/lib/utils';

const STATUS = ['', 'pending', 'paid', 'refunded', 'cancelled'];

export default function PaymentsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [open, setOpen] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [discount, setDiscount] = useState('0');

  const { data, isLoading } = useQuery({
    queryKey: ['payments', page, status],
    queryFn: () => api<Paginated<Payment>>(`/payments?page=${page}&limit=10${status ? `&status=${status}` : ''}`),
  });
  const orders = useQuery({ queryKey: ['orders-all'], queryFn: () => api<Paginated<Order>>('/orders?limit=100') });

  const create = useMutation({
    mutationFn: () => api('/payments', { method: 'POST', body: { orderId: Number(orderId), discountPercentage: Number(discount) } }),
    onSuccess: () => { toast.success('Invoice created'); setOpen(false); setOrderId(''); setDiscount('0'); qc.invalidateQueries({ queryKey: ['payments'] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const act = useMutation({
    mutationFn: ({ id, action }: { id: number; action: string }) => api(`/payments/${id}/${action}`, { method: 'PATCH' }),
    onSuccess: () => { toast.success('Payment updated'); qc.invalidateQueries({ queryKey: ['payments'] }); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div>
      <PageHeader title="Payments" subtitle="Invoice orders and record payments." action={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> New invoice</Button>} />

      <div className="mb-4 flex flex-wrap gap-2">
        {STATUS.map((st) => (
          <button key={st || 'all'} onClick={() => { setStatus(st); setPage(1); }}
            className={cn('rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition-colors', status === st ? 'bg-brand-600 text-white' : 'bg-ink-100/60 text-ink-800 hover:bg-ink-100')}>
            {st || 'All'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="card"><LoadingBlock /></div>
      ) : data && data.data.length > 0 ? (
        <>
          <Table head={<><Th>Invoice</Th><Th>Patient</Th><Th>Items</Th><Th>Amount</Th><Th>Status</Th><Th>Date</Th><Th className="text-right">Actions</Th></>}>
            {data.data.map((p) => (
              <Tr key={p.id}>
                <Td className="font-mono text-xs">#{p.id}</Td>
                <Td className="font-medium">{p.patient?.name ?? '—'}</Td>
                <Td className="text-ink-800/70">{p.items?.length ?? 0}</Td>
                <Td className="font-semibold">{formatMoney(p.totalAmount)}</Td>
                <Td><Badge status={p.status} /></Td>
                <Td className="text-ink-800/60">{formatDate(p.createdAt)}</Td>
                <Td className="text-right">
                  <div className="flex justify-end gap-1">
                    {p.status === 'pending' && (
                      <button onClick={() => act.mutate({ id: p.id, action: 'pay' })} title="Mark paid" className="rounded-lg p-2 text-emerald-600 hover:bg-emerald-50"><DollarSign className="h-4 w-4" /></button>
                    )}
                    {p.status === 'paid' && (
                      <button onClick={() => act.mutate({ id: p.id, action: 'refund' })} title="Refund" className="rounded-lg p-2 text-violet-600 hover:bg-violet-50"><RotateCcw className="h-4 w-4" /></button>
                    )}
                  </div>
                </Td>
              </Tr>
            ))}
          </Table>
          <Pagination page={page} totalPages={data.meta.totalPages} onChange={setPage} />
        </>
      ) : (
        <div className="card"><EmptyState title="No payments" hint="Create an invoice from an order." /></div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="New invoice"
        footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button loading={create.isPending} disabled={!orderId} onClick={() => create.mutate()}>Create invoice</Button></>}>
        <Select label="Order" value={orderId} onChange={(e) => setOrderId(e.target.value)}>
          <option value="">Select an order…</option>
          {orders.data?.data.map((o) => <option key={o.id} value={o.id}>#{o.id} · {o.patient?.name}</option>)}
        </Select>
        <Input label="Discount %" type="number" min={0} max={100} value={discount} onChange={(e) => setDiscount(e.target.value)} />
      </Modal>
    </div>
  );
}
