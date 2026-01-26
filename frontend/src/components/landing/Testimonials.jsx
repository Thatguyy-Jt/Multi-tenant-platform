import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      text: "The multi-tenant architecture and RBAC enforcement have completely transformed how our engineering team operates. It's the standard for secure SaaS platforms.",
      author: "Sarah Jenkins",
      role: "CTO at TechFlow",
      img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80"
    },
    {
      id: 2,
      text: "Security and tenant isolation were our top concerns. This platform delivered on every front, allowing us to scale without compromising data separation.",
      author: "Michael Chen",
      role: "VP of Product at Solar",
      img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80"
    },
    {
      id: 3,
      text: "We replaced three different tools with just this one platform. The tenant-aware architecture and role-based access control made deployment seamless.",
      author: "Elena Rodriguez",
      role: "Director at Velocity",
      img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80"
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  useEffect(() => {
    const interval = setInterval(next, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="py-32 bg-zinc-950 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4">Loved by innovators</h2>
          <p className="text-xl text-zinc-400">Join thousands of teams shipping faster.</p>
        </div>

        <div className="relative min-h-[300px]">
          {testimonials.map((item, index) => {
            let position = 'hidden';
            if (index === currentIndex) position = 'active';
            else if (index === (currentIndex + 1) % testimonials.length) position = 'next';
            else if (index === (currentIndex - 1 + testimonials.length) % testimonials.length) position = 'prev';

            const styles = {
              active: "opacity-100 scale-100 z-20 translate-x-0",
              next: "opacity-40 scale-90 z-10 translate-x-12 md:translate-x-32 blur-[2px]",
              prev: "opacity-40 scale-90 z-10 -translate-x-12 md:-translate-x-32 blur-[2px]",
              hidden: "opacity-0 scale-75 z-0"
            };

            return (
              <div
                key={item.id}
                className={`absolute top-0 left-0 right-0 mx-auto w-full md:w-[600px] p-8 md:p-12 rounded-3xl bg-zinc-900 border border-white/10 shadow-2xl transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${styles[position]}`}
              >
                <div className="flex flex-col items-center text-center gap-6">
                  <div className="w-16 h-16 rounded-full border-2 border-teal-500/30 p-1">
                    <img src={item.img} alt={item.author} className="w-full h-full rounded-full object-cover" />
                  </div>
                  <p className="text-xl md:text-2xl font-light text-zinc-200 leading-relaxed">
                    "{item.text}"
                  </p>
                  <div>
                    <div className="font-semibold text-white">{item.author}</div>
                    <div className="text-teal-500 text-sm">{item.role}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-center gap-4 mt-8 md:mt-12 relative z-30">
          <button
            onClick={prev}
            className="p-3 rounded-full border border-white/10 hover:bg-white/10 text-zinc-400 hover:text-white transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            className="p-3 rounded-full border border-white/10 hover:bg-white/10 text-zinc-400 hover:text-white transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
