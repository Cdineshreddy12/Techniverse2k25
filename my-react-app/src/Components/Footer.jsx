// Components/Footer.jsx
import React from 'react';
import { 
  Linkedin, 
  Youtube, 
  Instagram,
  Rocket 
} from 'lucide-react';

const Footer = () => {
  return (
    <footer className="relative  bg-slate-900/90 border-t border-slate-800">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-150" />
      </div>

      <div className="relative max-w-7xl mx-auto py-8 px-4">
        <div className="flex flex-col items-center gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Rocket className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-bold text-white">TECHFEST 2025</h2>
          </div>

          {/* Social Links */}
          <div className="flex gap-6">
            <a 
              href="#" 
              className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors group"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-6 h-6 text-slate-400 group-hover:text-cyan-400" />
            </a>
            <a 
              href="#" 
              className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors group"
              aria-label="YouTube"
            >
              <Youtube className="w-6 h-6 text-slate-400 group-hover:text-red-400" />
            </a>
            <a 
              href="#" 
              className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors group"
              aria-label="Instagram"
            >
              <Instagram className="w-6 h-6 text-slate-400 group-hover:text-pink-400" />
            </a>
          </div>

          {/* Copyright */}
          <p className="text-slate-400 text-sm">
            © {new Date().getFullYear()} Techfest. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;