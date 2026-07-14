'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import type { Paginated, Test } from '@/lib/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { Table, Th, Tr, Td } from '@/components/ui/Table';
import { SearchBar } from '@/components/ui/SearchBar';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState, LoadingBlock } from '@/components/ui/DataStates';
import { formatMoney } from '@/lib/utils';

const empty = { name: '', category: '', sampleType: '', price: '', unit: '', referenceRange: '', loincCode: '' };

export default function TestsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);

  const { data, isLoading } = useQuery({
    queryKey: ['tests', page, search],
    queryFn: () => api<Paginated<Test>>(`/tests?page=${page}&limit=10&search=${encodeURIComponent(search)}`),
  });

  const create = useMutation({
    mutationFn: () => api('/tests', { method: 'POST', body: { ...form, price: Number(form.price) } }),
    onSuccess: () => {
      toast.success('Test added');
      setOpen(false);
      setForm(empty);
      qc.invalidateQueries({ queryKey: ['tests'] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: number) => api(`/tests/${id}`, { method: 'DELETE' }),
    onSuccess: () => { toast.success('Test removed'); qc.invalidateQueries({ queryKey: ['tests'] }); },
    onError: (e: any) => toast.error(e.message),
  });

  function set(key: keyof typeof form) {
    return (e: React.ChangeEvent<any>) => setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  return (
    <div>
      <PageHeader
        title="Test catalogue"
        subtitle="Manage the tests your laboratory offers."
        action={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> New test</Button>}
      />
      <div className="mb-4"><SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search tests…" /></div>

      {isLoading ? (
        <div className="card"><LoadingBlock /></div>
      ) : data && data.data.length > 0 ? (
        <>
          <Table head={<><Th>Test</Th><Th>Category</Th><Th>Sample</Th><Th>Unit</Th><Th>Reference</Th><Th className="text-right">Price</Th><Th /></>}>
            {data.data.map((t) => (
              <Tr key={t.id}>
                <Td className="font-medium">{t.name}</Td>
                <Td className="text-ink-800/70">{t.category ?? '—'}</Td>
                <Td className="text-ink-800/70">{t.sampleType ?? '—'}</Td>
                <Td className="text-ink-800/70">{t.unit ?? '—'}</Td>
                <Td className="text-ink-800/60">{t.referenceRange ?? '—'}</Td>
                <Td className="text-right font-semibold">{formatMoney(t.price)}</Td>
                <Td className="text-right">
                  <button onClick={() => confirm('Delete test?') && remove.mutate(t.id)} className="rounded-lg p-2 text-ink-800/40 hover:bg-red-50 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </Td>
              </Tr>
            ))}
          </Table>
          <Pagination page={page} totalPages={data.meta.totalPages} onChange={setPage} />
        </>
      ) : (
        <div className="card"><EmptyState title="No tests yet" hint="Add your first test to the catalogue." /></div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add test"
        footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button loading={create.isPending} onClick={() => create.mutate()}>Save</Button></>}
      >
        <Input label="Name" value={form.name} onChange={set('name')} placeholder="Complete Blood Count" />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Category" value={form.category} onChange={set('category')} placeholder="Hematology" />
          <Input label="Sample type" value={form.sampleType} onChange={set('sampleType')} placeholder="Blood" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Price (USD)" type="number" value={form.price} onChange={set('price')} placeholder="25" />
          <Input label="Unit" value={form.unit} onChange={set('unit')} placeholder="mg/dL" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Reference range" value={form.referenceRange} onChange={set('referenceRange')} placeholder="70-99" />
          <Input label="LOINC code" value={form.loincCode} onChange={set('loincCode')} placeholder="58410-2" />
        </div>
      </Modal>
    </div>
  );
}
