'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import type { AppUser, Paginated } from '@/lib/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { Table, Th, Tr, Td } from '@/components/ui/Table';
import { SearchBar } from '@/components/ui/SearchBar';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState, LoadingBlock } from '@/components/ui/DataStates';
import { formatDate, initials, cn } from '@/lib/utils';

interface Role { id: number; name: string }
const empty = { name: '', email: '', password: '', phone: '' };

export default function UsersPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [roles, setRoles] = useState<string[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ['users', page, search],
    queryFn: () => api<Paginated<AppUser>>(`/users?page=${page}&limit=10&search=${encodeURIComponent(search)}`),
  });
  const rolesQ = useQuery({ queryKey: ['roles'], queryFn: () => api<Role[]>('/roles') });

  const create = useMutation({
    mutationFn: () => api('/users', { method: 'POST', body: { ...form, roles } }),
    onSuccess: () => { toast.success('User created'); setOpen(false); setForm(empty); setRoles([]); qc.invalidateQueries({ queryKey: ['users'] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: number) => api(`/users/${id}`, { method: 'DELETE' }),
    onSuccess: () => { toast.success('User removed'); qc.invalidateQueries({ queryKey: ['users'] }); },
    onError: (e: any) => toast.error(e.message),
  });

  function set(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [key]: e.target.value }));
  }
  function toggleRole(name: string) {
    setRoles((r) => (r.includes(name) ? r.filter((x) => x !== name) : [...r, name]));
  }

  return (
    <div>
      <PageHeader title="Users & roles" subtitle="Manage staff accounts and their access." action={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> New user</Button>} />
      <div className="mb-4"><SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search users…" /></div>

      {isLoading ? (
        <div className="card"><LoadingBlock /></div>
      ) : data && data.data.length > 0 ? (
        <>
          <Table head={<><Th>User</Th><Th>Email</Th><Th>Roles</Th><Th>Status</Th><Th>Joined</Th><Th /></>}>
            {data.data.map((u) => (
              <Tr key={u.id}>
                <Td>
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-xs font-bold text-white">{initials(u.name)}</span>
                    <span className="font-medium">{u.name}</span>
                  </div>
                </Td>
                <Td className="text-ink-800/70">{u.email}</Td>
                <Td>
                  <div className="flex flex-wrap gap-1">
                    {u.roles.length ? u.roles.map((r) => (
                      <span key={r} className="inline-flex items-center gap-1 rounded-md bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700"><ShieldCheck className="h-3 w-3" />{r}</span>
                    )) : <span className="text-ink-800/40">—</span>}
                  </div>
                </Td>
                <Td><span className={cn('rounded-full px-2 py-1 text-xs font-semibold', u.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-ink-100 text-ink-800')}>{u.isActive ? 'Active' : 'Disabled'}</span></Td>
                <Td className="text-ink-800/60">{formatDate(u.createdAt)}</Td>
                <Td className="text-right">
                  <button onClick={() => confirm('Delete user?') && remove.mutate(u.id)} className="rounded-lg p-2 text-ink-800/40 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                </Td>
              </Tr>
            ))}
          </Table>
          <Pagination page={page} totalPages={data.meta.totalPages} onChange={setPage} />
        </>
      ) : (
        <div className="card"><EmptyState title="No users" hint="Create the first staff account." /></div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="New user"
        footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button loading={create.isPending} onClick={() => create.mutate()}>Create user</Button></>}>
        <Input label="Full name" value={form.name} onChange={set('name')} placeholder="Jane Doe" />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Email" type="email" value={form.email} onChange={set('email')} placeholder="jane@lab.io" />
          <Input label="Phone" value={form.phone} onChange={set('phone')} placeholder="+1 555…" />
        </div>
        <Input label="Password" type="password" value={form.password} onChange={set('password')} placeholder="min. 6 characters" />
        <div>
          <p className="label">Roles</p>
          <div className="flex flex-wrap gap-2">
            {rolesQ.data?.map((r) => (
              <button key={r.id} type="button" onClick={() => toggleRole(r.name)}
                className={cn('rounded-lg px-3 py-1.5 text-sm font-medium transition-colors', roles.includes(r.name) ? 'bg-brand-600 text-white' : 'bg-ink-100/60 text-ink-800 hover:bg-ink-100')}>
                {r.name}
              </button>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}
