'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Input } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/auth-context';
import { staggerContainer, fadeUp } from '@/components/motion';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('admin@labsphere.io');
  const [password, setPassword] = useState('Admin@123');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.message ?? 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="show">
      <motion.div variants={fadeUp} className="mb-8">
        <h2 className="text-3xl font-bold">Sign in</h2>
        <p className="mt-2 text-sm text-ink-800/60">Access your LabSphere workspace.</p>
      </motion.div>

      <form onSubmit={onSubmit} className="space-y-4">
        <motion.div variants={fadeUp}>
          <Input
            id="email"
            label="Email address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@lab.io"
            required
          />
        </motion.div>
        <motion.div variants={fadeUp}>
          <Input
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </motion.div>
        <motion.div variants={fadeUp}>
          <Button type="submit" loading={loading} className="w-full">
            Sign in
          </Button>
        </motion.div>
      </form>

      <motion.p variants={fadeUp} className="mt-6 text-center text-sm text-ink-800/60">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="font-semibold text-brand-600 hover:underline">
          Create one
        </Link>
      </motion.p>

      <motion.div variants={fadeUp} className="mt-6 rounded-xl bg-brand-50 p-3 text-center text-xs text-brand-700">
        Demo · admin@labsphere.io / Admin@123
      </motion.div>
    </motion.div>
  );
}
