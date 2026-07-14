'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import type { Paginated, Patient, SupportRequest } from '@/lib/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { Table, Th, Tr, Td } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState, LoadingBlock } from '@/components/ui/DataStates';
import { formatDate } from '@/lib/utils';

export default function SupportPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [patientId, setPatientId] = useState('');
  const [discount, setDiscount] = useState('25');

  const { data, isLoading } = useQuery({
    queryKey: ['support', page],
    queryFn: () => api<Paginated<SupportRequest>>(`/support-requests?page=${page}&limit=10`),
  });
  const patients = useQuery({ queryKey: ['patients-all'], queryFn: () => api<Paginated<Patient>>('/patients?limit=100') });

  const create = useMutation({
    mutationFn: () => api('/support-requests', { method: 'POST', body: { patientId: Number(patientId), discountPercentage: Number(discount) } }),
    onSuccess: () => { toast.success('Request submitted'); setOpen(false); setPatientId(''); qc.invalidateQueries({ queryKey: ['support'] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const act = useMutation({
    mutationFn: ({ id, action }: { id: number; action: string }) => api(`/support-requests/${id}/${action}`, { method: 'PATCH' }),
    onSuccess: () => { toast.success('Updated'); qc.invalidateQueries({ queryKey: ['support'] }); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div>
      <PageHeader title="Financial support" subtitle="Review and approve discount requests." action={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> New request</Button>} />

      {isLoading ? (
        <div className="card"><LoadingBlock /></div>
      ) : data && data.data.length > 0 ? (
        <>
          <Table head={<><Th>Request</Th><Th>Patient</Th><Th>Discount</Th><Th>Status</Th><Th>Date</Th><Th className="text-right">Actions</Th></>}>
            {data.data.map((s) => (
              <Tr key={s.id}>
                <Td className="font-mono text-xs">#{s.id}</Td>
                <Td className="font-medium">{s.patient?.name ?? '—'}</Td>
                <Td className="font-semibold">{s.discountPercentage}%</Td>
                <Td><Badge status={s.status} /></Td>
                <Td className="text-ink-800/60">{formatDate(s.createdAt)}</Td>
                <Td className="text-right">
                  {s.status === 'pending' && (
                    <div className="flex justify-end gap-1">
                      <button onClick={() => act.mutate({ id: s.id, action: 'approve' })} className="rounded-lg p-2 text-emerald-600 hover:bg-emerald-50"><Check className="h-4 w-4" /></button>
                      <button onClick={() => act.mutate({ id: s.id, action: 'reject' })} className="rounded-lg p-2 text-red-500 hover:bg-red-50"><X className="h-4 w-4" /></button>
                    </div>
                  )}
                </Td>
              </Tr>
            ))}
          </Table>
          <Pagination page={page} totalPages={data.meta.totalPages} onChange={setPage} />
        </>
      ) : (
        <div className="card"><EmptyState title="No support requests" hint="Submit a discount request for a patient." /></div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Support request"
        footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button loading={create.isPending} disabled={!patientId} onClick={() => create.mutate()}>Submit</Button></>}>
        <Select label="Patient" value={patientId} onChange={(e) => setPatientId(e.target.value)}>
          <option value="">Select a patient…</option>
          {patients.data?.data.map((p) => <option key={p.id} value={p.id}>{p.name} · {p.patientNumber}</option>)}
        </Select>
        <Input label="Discount %" type="number" min={0} max={100} value={discount} onChange={(e) => setDiscount(e.target.value)} />
      </Modal>
    </div>
  );
}
