import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: 'How does tenant isolation work?',
      answer: 'Every organization is assigned a unique tenantId upon creation. All database queries are automatically scoped by this tenantId, ensuring complete data separation. Users can only access data belonging to their organization, enforced at both the middleware and database query levels. This multi-tenant architecture guarantees that organizations never see or access each other\'s data.',
    },
    {
      question: 'What RBAC roles are supported?',
      answer: 'The platform supports four role levels: Owner (full organization control, billing management), Admin (user management, project/task oversight), Member (project and task participation), and Super Admin (platform-wide access for system administrators). Permissions are enforced at both route-level (via middleware) and data-level (via tenant-scoped queries).',
    },
    {
      question: 'Is audit logging included?',
      answer: 'Yes, comprehensive audit logging is built into the platform. All user actions, authentication events, and administrative changes are logged with timestamps, user IDs, and tenant context. This ensures compliance with enterprise security requirements and provides full traceability for security audits and compliance reporting.',
    },
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="max-w-3xl mx-auto pt-20 pb-20 px-6">
      <h2 className="text-3xl font-semibold tracking-tight mb-10 text-center">
        Frequently asked questions
      </h2>
      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <div
            key={i}
            className="border border-white/10 rounded-lg overflow-hidden transition-all"
          >
            <button
              onClick={() => toggleFAQ(i)}
              className="w-full p-4 hover:bg-white/5 transition-colors flex justify-between items-center group text-left"
            >
              <span className="text-zinc-300 font-medium">{faq.question}</span>
              {openIndex === i ? (
                <Minus className="w-4 h-4 text-teal-400 transition-colors" />
              ) : (
                <Plus className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
              )}
            </button>
            {openIndex === i && (
              <div className="px-4 pb-4 animate-fade-in">
                <p className="text-zinc-400 leading-relaxed text-sm">
                  {faq.answer}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQ;
