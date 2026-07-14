'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { TestTubes } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import type { Paginated, TestRequest } from '@/lib/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { Table, Th, Tr, Td } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState, LoadingBlock } from '@/components/ui/DataStates';
import { Select } from '@/components/ui/Field';
import { formatDate, cn } from '@/lib/utils';

const STATUS = ['', 'pending', 'in_progress', 'completed', 'cancelled'];

export default function RequestsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['requests', page, status],
    queryFn: () => api<Paginated<TestRequest>>(`/requests?page=${page}&limit=10${status ? `&status=${status}` : ''}`),
  });

  const collect = useMutation({
    mutationFn: (requestId: number) => api('/samples', { method: 'POST', body: { requestId } }),
    onSuccess: () => { toast.success('Sample collected'); qc.invalidateQueries({ queryKey: ['requests'] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const setStatusM = useMutation({
    mutationFn: ({ id, value }: { id: number; value: string }) => api(`/requests/${id}/status`, { method: 'PATCH', body: { status: value } }),
    onSuccess: () => { toast.success('Status updated'); qc.invalidateQueries({ queryKey: ['requests'] }); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div>
      <PageHeader title="Test requests" subtitle="Track requests through the lab workflow." />

      <div className="mb-4 flex flex-wrap gap-2">
        {STATUS.map((st) => (
          <button
            key={st || 'all'}
            onClick={() => { setStatus(st); setPage(1); }}
            className={cn('rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition-colors', status === st ? 'bg-brand-600 text-white' : 'bg-ink-100/60 text-ink-800 hover:bg-ink-100')}
          >
            {st ? st.replace('_', ' ') : 'All'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="card"><LoadingBlock /></div>
      ) : data && data.data.length > 0 ? (
        <>
          <Table head={<><Th>Request</Th><Th>Patient</Th><Th>Items</Th><Th>Samples</Th><Th>Status</Th><Th>Created</Th><Th className="text-right">Actions</Th></>}>
            {data.data.map((r) => (
              <Tr key={r.id}>
                <Td className="font-mono text-xs">#{r.id}</Td>
                <Td className="font-medium">{r.order?.patient?.name ?? '—'}</Td>
                <Td className="text-ink-800/70">
                  {r.items?.map((i) => i.test?.name).filter(Boolean).slice(0, 2).join(', ')}
                  {(r.items?.length ?? 0) > 2 && ` +${(r.items?.length ?? 0) - 2}`}
                </Td>
                <Td className="text-ink-800/70">{r.samples?.length ?? 0}</Td>
                <Td><Badge status={r.status} /></Td>
                <Td className="text-ink-800/60">{formatDate(r.createdAt)}</Td>
                <Td>
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => collect.mutate(r.id)} className="btn-ghost px-2.5 py-1.5 text-xs">
                      <TestTubes className="h-3.5 w-3.5" /> Collect
                    </button>
                    <Select value={r.status} onChange={(e) => setStatusM.mutate({ id: r.id, value: e.target.value })} className="!py-1.5 !text-xs">
                      {STATUS.filter(Boolean).map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                    </Select>
                  </div>
                </Td>
              </Tr>
            ))}
          </Table>
          <Pagination page={page} totalPages={data.meta.totalPages} onChange={setPage} />
        </>
      ) : (
        <div className="card"><EmptyState title="No requests" hint="Requests are created from orders." /></div>
      )}
    </div>
  );
}
