import React from 'react';

const TrustSignals = () => {
  const companies = [
    { name: 'SpaceX', icon: '🚀' },
    { name: 'NASA', icon: '🌌' },
    { name: 'Uber', icon: '🚗' },
    { name: 'Visa', icon: '💳' },
    { name: 'Linear', icon: '📊' },
    { name: 'Stripe', icon: '💸' },
  ];

  return (
    <div className="py-20 border-y border-white/5 bg-white/[0.02]">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <p className="text-base text-zinc-500 mb-8 animate-fade-in">
          Trusted by forward-thinking organizations worldwide
        </p>
        <div className="flex flex-wrap justify-center gap-12 md:gap-20 items-center opacity-60 grayscale hover:grayscale-0 transition-all duration-500 animate-fade-in delay-200">
          {companies.map((company, i) => (
            <div key={i} className="hover:opacity-100 transition-opacity">
              <div className="w-8 h-8 text-2xl flex items-center justify-center">
                {company.icon}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrustSignals;
