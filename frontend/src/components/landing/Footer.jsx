import React from 'react';
import { Twitter, Github, Linkedin } from 'lucide-react';
import Logo from '../ui/Logo';

const Footer = () => {
  return (
    <footer className="border-t border-white/5 bg-black pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 mb-20">
          <div className="col-span-2 lg:col-span-2">
            <Logo />
            <p className="mt-6 text-zinc-500 text-sm max-w-xs leading-relaxed">
              Production-ready multi-tenant SaaS platform. Secure, scalable, and designed for enterprise organizations.
            </p>
            <div className="flex gap-4 mt-6">
              <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all">
                <Github className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-medium mb-6">Product</h4>
            <ul className="space-y-4 text-sm text-zinc-500">
              <li><a href="#features" className="hover:text-teal-400 transition-colors">Features</a></li>
              <li><a href="#architecture" className="hover:text-teal-400 transition-colors">Architecture</a></li>
              <li><a href="#" className="hover:text-teal-400 transition-colors">Changelog</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-medium mb-6">Company</h4>
            <ul className="space-y-4 text-sm text-zinc-500">
              <li><a href="#" className="hover:text-teal-400 transition-colors">About</a></li>
              <li><a href="#" className="hover:text-teal-400 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-teal-400 transition-colors">Blog</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-medium mb-6">Legal</h4>
            <ul className="space-y-4 text-sm text-zinc-500">
              <li><a href="#" className="hover:text-teal-400 transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-teal-400 transition-colors">Terms</a></li>
              <li><a href="#" className="hover:text-teal-400 transition-colors">Security</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-zinc-600">
          <p>© 2026 Multi-Tenant SaaS Platform. All rights reserved.</p>
          <div className="flex gap-6">
            <span>Designed with precision</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
