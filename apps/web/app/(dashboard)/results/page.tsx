'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Eye, CheckCircle2, ShieldCheck, XCircle, History } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import type { Device, Paginated, Result, TestRequest } from '@/lib/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { Table, Th, Tr, Td } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState, LoadingBlock } from '@/components/ui/DataStates';
import { formatDateTime, cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';

const STATUS = ['', 'pending', 'entered', 'reviewed', 'approved', 'rejected'];

export default function ResultsPage() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [historyOf, setHistoryOf] = useState<Result | null>(null);

  const can = (p: string) => user?.permissions?.includes(p);

  const { data, isLoading } = useQuery({
    queryKey: ['results', page, status],
    queryFn: () => api<Paginated<Result>>(`/results?page=${page}&limit=10${status ? `&status=${status}` : ''}`),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['results'] });

  const act = useMutation({
    mutationFn: ({ id, action, reason }: { id: number; action: string; reason?: string }) =>
      api(`/results/${id}/${action}`, { method: 'PATCH', body: reason ? { reason } : undefined }),
    onSuccess: () => { toast.success('Result updated'); invalidate(); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div>
      <PageHeader
        title="Results"
        subtitle="Enter, review and approve laboratory results."
        action={can('results.write') && <Button onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" /> Enter result</Button>}
      />

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
          <Table head={<><Th>Test</Th><Th>Patient</Th><Th>Value</Th><Th>Entered by</Th><Th>Status</Th><Th className="text-right">Workflow</Th></>}>
            {data.data.map((r) => {
              const test = r.requestItem?.test;
              const patient = r.requestItem?.request?.order?.patient;
              return (
                <Tr key={r.id}>
                  <Td className="font-medium">{test?.name ?? '—'}</Td>
                  <Td className="text-ink-800/70">{patient?.name ?? '—'}</Td>
                  <Td>
                    <span className="font-semibold">{r.value ?? '—'}</span>
                    {test?.unit && <span className="ml-1 text-xs text-ink-800/50">{test.unit}</span>}
                    {test?.referenceRange && <span className="ml-2 text-[11px] text-ink-800/40">(ref {test.referenceRange})</span>}
                  </Td>
                  <Td className="text-ink-800/70">{r.enteredByUser?.name ?? '—'}</Td>
                  <Td><Badge status={r.status} /></Td>
                  <Td>
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setHistoryOf(r)} title="History" className="rounded-lg p-2 text-ink-800/40 hover:bg-ink-100"><History className="h-4 w-4" /></button>
                      {can('results.review') && r.status === 'entered' && (
                        <button onClick={() => act.mutate({ id: r.id, action: 'review' })} title="Mark reviewed" className="rounded-lg p-2 text-violet-600 hover:bg-violet-50"><Eye className="h-4 w-4" /></button>
                      )}
                      {can('results.approve') && (r.status === 'reviewed' || r.status === 'entered') && (
                        <button onClick={() => act.mutate({ id: r.id, action: 'approve' })} title="Approve" className="rounded-lg p-2 text-emerald-600 hover:bg-emerald-50"><ShieldCheck className="h-4 w-4" /></button>
                      )}
                      {can('results.review') && r.status !== 'approved' && r.status !== 'rejected' && (
                        <button onClick={() => { const reason = prompt('Reason for rejection?') ?? undefined; act.mutate({ id: r.id, action: 'reject', reason }); }} title="Reject" className="rounded-lg p-2 text-red-500 hover:bg-red-50"><XCircle className="h-4 w-4" /></button>
                      )}
                    </div>
                  </Td>
                </Tr>
              );
            })}
          </Table>
          <Pagination page={page} totalPages={data.meta.totalPages} onChange={setPage} />
        </>
      ) : (
        <div className="card"><EmptyState title="No results" hint="Enter a result for a completed sample." /></div>
      )}

      {createOpen && <CreateResultModal onClose={() => setCreateOpen(false)} onDone={invalidate} />}
      <HistoryModal result={historyOf} onClose={() => setHistoryOf(null)} />
    </div>
  );
}

function CreateResultModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [requestItemId, setRequestItemId] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [value, setValue] = useState('');
  const [comments, setComments] = useState('');

  const requests = useQuery({ queryKey: ['requests-open'], queryFn: () => api<Paginated<TestRequest>>('/requests?limit=100') });
  const devices = useQuery({ queryKey: ['devices'], queryFn: () => api<Device[]>('/devices') });

  const items = (requests.data?.data ?? []).flatMap((r) =>
    (r.items ?? [])
      .filter((i) => i.status !== 'completed' && i.status !== 'rejected')
      .map((i) => ({ id: i.id, label: `${r.order?.patient?.name ?? 'Patient'} · ${i.test?.name ?? 'Test'} (req #${r.id})` })),
  );

  const create = useMutation({
    mutationFn: () => api('/results', { method: 'POST', body: { requestItemId: Number(requestItemId), value, comments: comments || undefined, deviceId: deviceId ? Number(deviceId) : undefined } }),
    onSuccess: () => { toast.success('Result entered'); onClose(); onDone(); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <Modal
      open
      onClose={onClose}
      title="Enter result"
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button loading={create.isPending} disabled={!requestItemId || !value} onClick={() => create.mutate()}>Save result</Button></>}
    >
      <Select label="Test item" value={requestItemId} onChange={(e) => setRequestItemId(e.target.value)}>
        <option value="">Select a pending test item…</option>
        {items.map((i) => <option key={i.id} value={i.id}>{i.label}</option>)}
      </Select>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Value" value={value} onChange={(e) => setValue(e.target.value)} placeholder="e.g. 5.6" />
        <Select label="Device" value={deviceId} onChange={(e) => setDeviceId(e.target.value)}>
          <option value="">—</option>
          {devices.data?.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </Select>
      </div>
      <Textarea label="Comments" value={comments} onChange={(e) => setComments(e.target.value)} placeholder="Optional notes…" />
    </Modal>
  );
}

function HistoryModal({ result, onClose }: { result: Result | null; onClose: () => void }) {
  const { data } = useQuery({
    queryKey: ['result', result?.id],
    queryFn: () => api<Result>(`/results/${result!.id}`),
    enabled: !!result,
  });

  return (
    <Modal open={!!result} onClose={onClose} title="Result history">
      {!data ? (
        <LoadingBlock rows={3} />
      ) : data.history && data.history.length > 0 ? (
        <ol className="relative space-y-4 border-l border-ink-100 pl-5">
          {data.history.map((h) => (
            <li key={h.id} className="relative">
              <span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full bg-brand-500 ring-4 ring-brand-100" />
              <p className="text-sm">
                <span className="text-ink-800/50">{h.oldValue ?? '∅'}</span> → <span className="font-semibold">{h.newValue}</span>
              </p>
              <p className="text-[11px] text-ink-800/40">
                {h.changedByUser?.name ?? 'System'} · {formatDateTime(h.changedAt)}
              </p>
            </li>
          ))}
        </ol>
      ) : (
        <p className="py-6 text-center text-sm text-ink-800/50">No changes recorded.</p>
      )}
    </Modal>
  );
}
