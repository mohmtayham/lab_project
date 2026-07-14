'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Input } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { staggerContainer, fadeUp } from '@/components/motion';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  function set(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api('/auth/signup', { method: 'POST', auth: false, body: form });
      toast.success('Account created!');
      await login(form.email, form.password);
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.message ?? 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="show">
      <motion.div variants={fadeUp} className="mb-8">
        <h2 className="text-3xl font-bold">Create account</h2>
        <p className="mt-2 text-sm text-ink-800/60">Join your laboratory workspace.</p>
      </motion.div>

      <form onSubmit={onSubmit} className="space-y-4">
        <motion.div variants={fadeUp}>
          <Input id="name" label="Full name" value={form.name} onChange={set('name')} placeholder="Jane Doe" required />
        </motion.div>
        <motion.div variants={fadeUp}>
          <Input id="email" label="Email address" type="email" value={form.email} onChange={set('email')} placeholder="you@lab.io" required />
        </motion.div>
        <motion.div variants={fadeUp}>
          <Input id="password" label="Password" type="password" value={form.password} onChange={set('password')} placeholder="min. 6 characters" minLength={6} required />
        </motion.div>
        <motion.div variants={fadeUp}>
          <Button type="submit" loading={loading} className="w-full">
            Create account
          </Button>
        </motion.div>
      </form>

      <motion.p variants={fadeUp} className="mt-6 text-center text-sm text-ink-800/60">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-brand-600 hover:underline">
          Sign in
        </Link>
      </motion.p>
    </motion.div>
  );
}
