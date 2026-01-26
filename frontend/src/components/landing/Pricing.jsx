import React from 'react';
import { Check } from 'lucide-react';
import Button from '../ui/Button';

const Pricing = () => {
  const plans = [
    {
      title: "Free",
      price: "0",
      features: [
        'Basic tenant isolation',
        'Up to 3 team members',
        'Community support',
        '1 organization workspace',
      ],
      recommended: false,
    },
    {
      title: "Pro",
      price: "49",
      features: [
        'Advanced RBAC enforcement',
        'Unlimited team members',
        'Priority support',
        '5 organization workspaces',
        'Custom domain support',
      ],
      recommended: true,
    },
    {
      title: "Enterprise",
      price: "99",
      features: [
        'Custom RBAC configurations',
        'SSO & audit logging',
        '24/7 dedicated support',
        'Unlimited workspaces',
        'SLA guarantee',
      ],
      recommended: false,
    },
  ];

  return (
    <section id="pricing" className="py-32 border-t border-white/5 bg-zinc-950">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-semibold tracking-tight mb-4">Simple, scalable pricing</h2>
          <p className="text-zinc-400">No extra charges. No hidden fees. Cancel anytime.</p>
          <p className="text-zinc-500 text-sm mt-2">Pricing shown for demonstration purposes.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative p-8 rounded-3xl border flex flex-col h-full ${
                plan.recommended
                  ? 'bg-white/5 border-teal-500/50 shadow-2xl shadow-teal-900/20'
                  : 'bg-black/40 border-white/10'
              }`}
            >
              {plan.recommended && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-teal-500 text-black text-xs font-bold uppercase tracking-wide">
                  Most Popular
                </div>
              )}
              
              <div className="mb-8">
                <h3 className="text-lg font-medium text-zinc-400">{plan.title}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-semibold text-white">${plan.price}</span>
                  <span className="text-zinc-500">/mo</span>
                </div>
              </div>
              
              <div className="flex-1 space-y-4 mb-8">
                {plan.features.map((feat, i) => (
                  <div key={i} className="flex items-center gap-3 text-zinc-300 text-sm">
                    <Check className={`w-4 h-4 ${plan.recommended ? 'text-teal-400' : 'text-zinc-600'}`} />
                    {feat}
                  </div>
                ))}
              </div>
              
              <Button
                variant={plan.recommended ? 'primary' : 'secondary'}
                className="w-full text-center justify-center"
              >
                {plan.recommended ? 'Start Free Trial' : 'Get Started'}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
