import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';

const Hero = () => {
  return (
    <main className="pt-32 pb-20 px-6 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-teal-600/20 rounded-[100%] blur-[120px] pointer-events-none animate-pulse"></div>
      
      <div className="max-w-5xl mx-auto text-center relative z-10">
        <h1 className="text-5xl md:text-7xl font-semibold tracking-tighter leading-[1.1] mb-8 animate-clip-in delay-100">
          Secure, Multi-Tenant Infrastructure <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-500">
            for Modern Organizations.
          </span>
        </h1>

        <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 animate-clip-in delay-200">
          Production-ready foundation with role-based access control, tenant isolation, and secure authentication. 
          Built for organizations that demand enterprise-grade security and scalability.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-clip-in delay-300">
          <Link to="/signup">
            <Button variant="primary" className="w-full sm:w-auto">
              Explore Admin Capabilities
            </Button>
          </Link>
          <Link to="#architecture">
            <Button variant="secondary" className="w-full sm:w-auto">
              View Architecture
            </Button>
          </Link>
        </div>
      </div>

      <DashboardPreview />
    </main>
  );
};

const DashboardPreview = () => {
  return (
    <div className="relative w-full max-w-5xl mx-auto mt-20 animate-clip-in delay-300">
      <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-2xl blur opacity-20"></div>
      
      <div className="relative rounded-xl bg-[#0F0F11] border border-white/10 shadow-2xl overflow-hidden">
        {/* Browser Window Toolbar */}
        <div className="h-10 border-b border-white/5 flex items-center px-4 gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50"></div>
          </div>
          <div className="flex-1 text-center">
            <div className="inline-block px-3 py-0.5 rounded-md bg-white/5 text-[10px] text-zinc-500 font-mono">
              platform.app/dashboard
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="flex h-[500px] md:h-[600px]">
          {/* Sidebar */}
          <div className="w-16 md:w-60 border-r border-white/5 flex flex-col p-4 gap-6 hidden md:flex">
            <div className="space-y-1">
              <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 pl-2">Platform</div>
              {['Overview', 'Analytics', 'Team', 'Projects', 'Settings'].map((item, i) => (
                <div
                  key={item}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors ${
                    i === 0
                      ? 'bg-white/5 text-white'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className={`w-4 h-4 rounded ${i === 0 ? 'bg-teal-500' : 'bg-zinc-700'}`}></div>
                  {item}
                </div>
              ))}
            </div>
            
            <div className="mt-auto p-3 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-700"></div>
                <div className="flex-1">
                  <div className="h-2 w-16 bg-zinc-600 rounded mb-1.5"></div>
                  <div className="h-1.5 w-10 bg-zinc-700 rounded"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 p-6 md:p-8 overflow-hidden bg-black/20">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h3 className="text-2xl font-semibold text-white tracking-tight">Overview</h3>
                <p className="text-zinc-400 text-sm mt-1">Welcome back, Admin</p>
              </div>
              <div className="flex gap-2">
                <div className="px-3 py-1.5 rounded-md border border-white/10 text-xs text-zinc-400 bg-white/5">
                  Last 30 Days
                </div>
                <div className="px-3 py-1.5 rounded-md bg-teal-500 text-xs text-black font-semibold">
                  Export Report
                </div>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {['Active Organizations', 'Total Users', 'Projects'].map((metric, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/[0.07] transition-colors"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                    <div className="text-xs text-zinc-400 uppercase">{metric}</div>
                  </div>
                  <div className="text-3xl font-semibold text-white mb-1">24.5k</div>
                  <div className="flex items-center gap-1 text-xs text-emerald-400">
                    <span>12.5% increase</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Chart Visualization */}
            <div className="w-full h-48 md:h-64 rounded-xl border border-white/5 bg-white/5 relative overflow-hidden flex items-end px-1 gap-1">
              {Array.from({ length: 40 }, (_, i) => {
                const height = Math.random() * 80 + 20;
                return (
                  <div
                    key={i}
                    style={{ height: `${height}%` }}
                    className="flex-1 bg-gradient-to-t from-teal-500/20 to-teal-500/50 rounded-t-sm hover:from-teal-400/30 hover:to-teal-400/60 transition-colors"
                  ></div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
