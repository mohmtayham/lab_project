'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { QrCode } from 'lucide-react';
import { api } from '@/lib/api';
import type { Paginated, Sample } from '@/lib/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { Table, Th, Tr, Td } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Field';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState, LoadingBlock } from '@/components/ui/DataStates';
import { formatDateTime, cn } from '@/lib/utils';

const STATUS = ['', 'collected', 'in_lab', 'processed', 'rejected'];

export default function SamplesPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['samples', page, status],
    queryFn: () => api<Paginated<Sample>>(`/samples?page=${page}&limit=10${status ? `&status=${status}` : ''}`),
  });

  const setStatusM = useMutation({
    mutationFn: ({ id, value }: { id: number; value: string }) => api(`/samples/${id}/status`, { method: 'PATCH', body: { status: value } }),
    onSuccess: () => { toast.success('Sample updated'); qc.invalidateQueries({ queryKey: ['samples'] }); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div>
      <PageHeader title="Samples" subtitle="Track sample collection and processing." />

      <div className="mb-4 flex flex-wrap gap-2">
        {STATUS.map((st) => (
          <button key={st || 'all'} onClick={() => { setStatus(st); setPage(1); }}
            className={cn('rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition-colors', status === st ? 'bg-brand-600 text-white' : 'bg-ink-100/60 text-ink-800 hover:bg-ink-100')}>
            {st ? st.replace('_', ' ') : 'All'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="card"><LoadingBlock /></div>
      ) : data && data.data.length > 0 ? (
        <>
          <Table head={<><Th>QR / ID</Th><Th>Patient</Th><Th>Type</Th><Th>Collected by</Th><Th>Collected</Th><Th>Status</Th><Th className="text-right">Update</Th></>}>
            {data.data.map((s) => (
              <Tr key={s.id}>
                <Td>
                  <span className="inline-flex items-center gap-2 font-mono text-xs text-ink-800/70">
                    <QrCode className="h-4 w-4 text-brand-500" /> {s.qrCode ?? `#${s.id}`}
                  </span>
                </Td>
                <Td className="font-medium">{s.request?.order?.patient?.name ?? '—'}</Td>
                <Td className="text-ink-800/70">{s.sampleType ?? '—'}</Td>
                <Td className="text-ink-800/70">{s.collector?.name ?? '—'}</Td>
                <Td className="text-ink-800/60">{formatDateTime(s.collectedAt)}</Td>
                <Td><Badge status={s.status} /></Td>
                <Td className="text-right">
                  <Select value={s.status} onChange={(e) => setStatusM.mutate({ id: s.id, value: e.target.value })} className="!py-1.5 !text-xs">
                    {STATUS.filter(Boolean).map((st) => <option key={st} value={st}>{st.replace('_', ' ')}</option>)}
                  </Select>
                </Td>
              </Tr>
            ))}
          </Table>
          <Pagination page={page} totalPages={data.meta.totalPages} onChange={setPage} />
        </>
      ) : (
        <div className="card"><EmptyState title="No samples" hint="Collect samples from the Requests page." /></div>
      )}
    </div>
  );
}
