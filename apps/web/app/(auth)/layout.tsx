'use client';

import { motion } from 'framer-motion';
import { FlaskConical, ShieldCheck, Activity, Microscope } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Branding / marketing panel */}
      <div className="aurora relative hidden overflow-hidden bg-ink-900 lg:block">
        <div className="relative z-10 flex h-full flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-white/10 backdrop-blur">
              <FlaskConical className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold">LabSphere</span>
          </div>

          <div className="max-w-md">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl font-bold leading-tight"
            >
              The modern operating system for your laboratory.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-4 text-white/70"
            >
              From patient registration to sample tracking, result validation and billing — all in one
              elegant, secure workspace.
            </motion.p>

            <div className="mt-8 grid grid-cols-1 gap-3">
              {[
                { icon: Activity, text: 'Real-time result validation workflow' },
                { icon: Microscope, text: 'Sample & device traceability' },
                { icon: ShieldCheck, text: 'Role-based access control' },
              ].map((f, i) => (
                <motion.div
                  key={f.text}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3 backdrop-blur"
                >
                  <f.icon className="h-5 w-5 text-brand-200" />
                  <span className="text-sm text-white/85">{f.text}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <p className="text-xs text-white/40">© {new Date().getFullYear()} LabSphere · All rights reserved</p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
