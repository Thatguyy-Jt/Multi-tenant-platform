import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../ui/Logo';
import Button from '../ui/Button';

const Navbar = () => {
  return (
    <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl animate-fade-in">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Logo />
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#architecture" className="hover:text-white transition-colors">Architecture</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="#docs" className="hover:text-white transition-colors">Docs</a>
          <a href="#company" className="hover:text-white transition-colors">Company</a>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-medium text-zinc-400 hover:text-white cursor-pointer hidden sm:block">
            Log in
          </Link>
          <Link to="/signup">
            <Button variant="secondary" className="!py-2 !px-4 text-sm !rounded-lg">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
