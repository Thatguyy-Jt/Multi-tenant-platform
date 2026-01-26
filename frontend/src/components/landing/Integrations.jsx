import React from 'react';
import Button from '../ui/Button';

const Integrations = () => {
  const apps = [
    { name: 'Slack', color: 'bg-[#4A154B]', letter: 'S' },
    { name: 'Salesforce', color: 'bg-[#00A1E0]', letter: 'Sa' },
    { name: 'Zapier', color: 'bg-[#FF4F00]', letter: 'Z' },
    { name: 'Notion', color: 'bg-white text-black', letter: 'N' },
    { name: 'HubSpot', color: 'bg-[#FF7A59]', letter: 'H' },
    { name: 'GitHub', color: 'bg-[#181717]', letter: 'G' },
  ];

  return (
    <div className="py-32 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-xl">
            <h2 className="text-4xl font-semibold tracking-tight mb-4">Seamless Integrations</h2>
            <p className="text-lg text-zinc-400">
              Connect with your favorite tools. We support over 100+ native integrations to keep your workflow uninterrupted.
            </p>
          </div>
          <Button variant="secondary">View all integrations</Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {apps.map((app) => (
            <div
              key={app.name}
              className="group p-6 rounded-2xl bg-zinc-900 border border-white/5 hover:border-white/20 transition-all cursor-pointer flex flex-col items-center justify-center gap-4 aspect-square"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold ${app.color} shadow-lg group-hover:scale-110 transition-transform`}>
                {app.letter}
              </div>
              <span className="text-sm font-medium text-zinc-400 group-hover:text-white">
                {app.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Integrations;
