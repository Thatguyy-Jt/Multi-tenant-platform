import React from 'react';
import { Check, Users, Shield, FolderKanban, Send, BarChart2, Sparkles } from 'lucide-react';

const Features = () => {
  const features = [
    {
      number: '01',
      title: 'Tenant-Aware User Management',
      description: 'Organization-scoped user provisioning with automatic tenant isolation. Role-based access control enforced at both route and data levels for secure multi-tenancy.',
      bullets: [
        'Automatic tenant isolation',
        'JWT + HTTP-only cookie authentication',
        'Organization-scoped user provisioning',
      ],
      visual: <VisualOne />,
    },
    {
      number: '02',
      title: 'RBAC Enforcement & Data Isolation',
      description: 'Granular permissions for Owners, Admins, and Members. All database queries are automatically scoped by tenantId to ensure complete data separation.',
      bullets: [
        'Route-level RBAC middleware',
        'Tenant-scoped MongoDB queries',
        'Audit logging for compliance',
      ],
      visual: <VisualTwo />,
      align: 'right',
    },
    {
      number: '03',
      title: 'Project & Task Management with RBAC',
      description: 'Organization-scoped projects and tasks with role-based permissions. Secure billing lifecycle handling with subscription management and usage tracking.',
      bullets: [
        'Project isolation per organization',
        'Role-based task assignments',
        'Secure subscription billing',
      ],
      visual: <VisualThree />,
    },
  ];

  return (
    <section id="features" className="max-w-7xl mx-auto px-6 py-20">
      {features.map((feature, index) => (
        <div
          key={index}
          className={`flex flex-col md:flex-row items-center gap-12 md:gap-24 py-24 ${
            feature.align === 'right' ? 'md:flex-row-reverse' : ''
          }`}
        >
          <div className="flex-1 w-full space-y-6">
            <span className="text-teal-500 font-mono text-sm tracking-wider">{feature.number}</span>
            <h3 className="text-3xl md:text-4xl font-semibold tracking-tight text-white leading-[1.1]">
              {feature.title}
            </h3>
            <p className="text-lg text-zinc-400 leading-relaxed max-w-md">
              {feature.description}
            </p>
            <ul className="space-y-3 pt-4">
              {feature.bullets.map((bullet, i) => (
                <li key={i} className="flex items-center gap-3 text-zinc-300">
                  <div className="w-5 h-5 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-400">
                    <Check className="w-3 h-3" />
                  </div>
                  {bullet}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex-1 w-full relative group">
            <div className="absolute -inset-1 bg-gradient-to-br from-teal-500/20 to-purple-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <div className="relative aspect-square md:aspect-[4/3] bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center">
              {feature.visual}
            </div>
          </div>
        </div>
      ))}
    </section>
  );
};

const VisualOne = () => (
  <div className="relative w-full h-full flex items-center justify-center bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-800 to-zinc-900">
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
    <div className="relative w-64 h-64">
      <div className="absolute top-0 left-0 p-4 bg-zinc-800 border border-white/10 rounded-2xl shadow-xl animate-float">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center">
            <Users className="w-4 h-4 text-black" />
          </div>
          <div>
            <div className="w-20 h-2 bg-zinc-600 rounded mb-1"></div>
            <div className="w-12 h-2 bg-zinc-700 rounded"></div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 right-0 p-4 bg-zinc-800 border border-white/10 rounded-2xl shadow-xl animate-float delay-500">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="w-16 h-2 bg-zinc-600 rounded mb-1"></div>
            <div className="w-10 h-2 bg-zinc-700 rounded"></div>
          </div>
        </div>
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-teal-500/30 flex items-center justify-center animate-pulse">
        <div className="w-24 h-24 rounded-full border border-teal-500/50 flex items-center justify-center">
          <div className="w-4 h-4 rounded-full bg-teal-400 shadow-[0_0_20px_rgba(45,212,191,0.5)]"></div>
        </div>
      </div>
    </div>
  </div>
);

const VisualTwo = () => (
  <div className="relative w-full h-full bg-zinc-900 flex flex-col p-8 gap-4">
    <div className="text-zinc-500 text-xs font-mono mb-2">RBAC SYSTEM...</div>
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="flex items-center gap-4 p-3 rounded-lg border border-white/5 bg-white/[0.02]">
        <div className={`w-2 h-2 rounded-full ${i === 3 ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}></div>
        <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div className="h-full bg-zinc-600 w-2/3"></div>
        </div>
        <div className="text-xs text-zinc-500 font-mono">
          {Math.floor(Math.random() * 100)}ms
        </div>
      </div>
    ))}
    <div className="mt-auto p-4 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-300 text-sm">
      RBAC validation complete. Score: 98/100
    </div>
  </div>
);

const VisualThree = () => (
  <div className="w-full h-full bg-zinc-900 flex items-center justify-center relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-b from-teal-500/5 to-transparent"></div>
    <div className="w-3/4 space-y-3">
      <div className="h-2 bg-zinc-800 rounded w-full animate-pulse"></div>
      <div className="h-2 bg-zinc-800 rounded w-5/6 animate-pulse delay-100"></div>
      <div className="h-2 bg-zinc-800 rounded w-4/6 animate-pulse delay-200"></div>
      <div className="mt-4 p-3 bg-teal-500/10 border border-teal-500/20 rounded-lg flex items-center gap-2 text-teal-300 text-xs">
        <FolderKanban className="w-3 h-3" />
        Tenant-Scoped Project
      </div>
    </div>
  </div>
);

export default Features;
