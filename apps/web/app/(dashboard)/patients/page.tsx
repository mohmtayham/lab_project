'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import type { Paginated, Patient } from '@/lib/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { Table, Th, Tr, Td } from '@/components/ui/Table';
import { SearchBar } from '@/components/ui/SearchBar';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState, ErrorState, LoadingBlock } from '@/components/ui/DataStates';
import { formatDate, initials } from '@/lib/utils';

const empty = { name: '', phone: '', email: '', address: '', gender: 'unknown', dateOfBirth: '' };

export default function PatientsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['patients', page, search],
    queryFn: () => api<Paginated<Patient>>(`/patients?page=${page}&limit=10&search=${encodeURIComponent(search)}`),
  });

  const create = useMutation({
    mutationFn: () => api('/patients', { method: 'POST', body: cleanup(form) }),
    onSuccess: () => {
      toast.success('Patient registered');
      setOpen(false);
      setForm(empty);
      qc.invalidateQueries({ queryKey: ['patients'] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: number) => api(`/patients/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast.success('Patient removed');
      qc.invalidateQueries({ queryKey: ['patients'] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  function set(key: keyof typeof form) {
    return (e: React.ChangeEvent<any>) => setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  return (
    <div>
      <PageHeader
        title="Patients"
        subtitle="Register and manage patient records."
        action={
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> New patient
          </Button>
        }
      />

      <div className="mb-4">
        <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search by name, number, phone…" />
      </div>

      {isLoading ? (
        <div className="card"><LoadingBlock /></div>
      ) : isError ? (
        <ErrorState message={(error as any)?.message ?? 'Failed to load'} />
      ) : data && data.data.length > 0 ? (
        <>
          <Table
            head={
              <>
                <Th>Patient</Th>
                <Th>Number</Th>
                <Th>Contact</Th>
                <Th>Gender</Th>
                <Th>Registered</Th>
                <Th className="text-right">Actions</Th>
              </>
            }
          >
            {data.data.map((p) => (
              <Tr key={p.id}>
                <Td>
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-100 text-xs font-bold text-brand-700">
                      {initials(p.name)}
                    </span>
                    <span className="font-medium">{p.name}</span>
                  </div>
                </Td>
                <Td className="font-mono text-xs text-ink-800/60">{p.patientNumber}</Td>
                <Td className="text-ink-800/70">{p.phone ?? p.email ?? '—'}</Td>
                <Td className="capitalize">{p.gender}</Td>
                <Td className="text-ink-800/60">{formatDate(p.createdAt)}</Td>
                <Td className="text-right">
                  <button
                    onClick={() => confirm('Delete this patient?') && remove.mutate(p.id)}
                    className="rounded-lg p-2 text-ink-800/40 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </Td>
              </Tr>
            ))}
          </Table>
          <Pagination page={page} totalPages={data.meta.totalPages} onChange={setPage} />
        </>
      ) : (
        <div className="card"><EmptyState title="No patients yet" hint="Register your first patient to get started." /></div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Register patient"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button loading={create.isPending} onClick={() => create.mutate()}>Save patient</Button>
          </>
        }
      >
        <Input label="Full name" value={form.name} onChange={set('name')} placeholder="John Carter" />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Phone" value={form.phone} onChange={set('phone')} placeholder="+1 555…" />
          <Input label="Email" type="email" value={form.email} onChange={set('email')} placeholder="john@example.com" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Select label="Gender" value={form.gender} onChange={set('gender')}>
            <option value="unknown">Unknown</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </Select>
          <Input label="Date of birth" type="date" value={form.dateOfBirth} onChange={set('dateOfBirth')} />
        </div>
        <Textarea label="Address" value={form.address} onChange={set('address')} placeholder="Street, city…" />
      </Modal>
    </div>
  );
}

function cleanup(form: typeof empty) {
  const out: Record<string, unknown> = {};
  Object.entries(form).forEach(([k, v]) => {
    if (v !== '' && v !== null) out[k] = v;
  });
  return out;
}
