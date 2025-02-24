import React from 'react';
import { 
  MessageSquare,
  Youtube, 
  Instagram,
  Rocket,
  MapPin
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="relative bg-slate-900/90 border-t border-slate-800">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-150" />
      </div>

      <div className="relative max-w-7xl mx-auto py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and Social Links */}
          <div className="flex flex-col items-center md:items-start gap-6">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Rocket className="w-6 h-6 text-cyan-400" />
              <h2 className="text-xl font-bold text-white">TECHFEST 2025</h2>
            </div>

            {/* Social Links */}
            <div className="flex gap-6">
              <a 
                href="https://whatsapp.com/channel/0029Vb4zMJILSmbkE0LB882t" 
                className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors group"
                aria-label="WhatsApp"
              >
                <MessageSquare className="w-6 h-6 text-slate-400 group-hover:text-green-400" />
              </a>
              <a 
                href="https://youtube.com/@rgukt_srikakulam_official?si=poWE_ks1MrjBhWA7" 
                className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors group"
                aria-label="YouTube"
              >
                <Youtube className="w-6 h-6 text-slate-400 group-hover:text-red-400" />
              </a>
              <a 
                href="https://www.instagram.com/techniverse_2k25?igsh=MWhhMWE4MzMxd3d2Zw==" 
                className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors group"
                aria-label="Instagram"
              >
                <Instagram className="w-6 h-6 text-slate-400 group-hover:text-pink-400" />
              </a>
            </div>

            {/* Copyright */}
            <p className="text-slate-400 text-sm mt-4">
              © {new Date().getFullYear()} Techfest. All rights reserved.
            </p>
          </div>

          {/* Policies */}
          <div className="text-white">
            <h3 className="text-lg font-semibold mb-4">Policies</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/shipping-policy" className="hover:text-purple-400">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link to="/cancellation-policy" className="hover:text-purple-400">
                  Cancellation & Refund Policy
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-purple-400">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-and-conditions" className="hover:text-purple-400">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Location and Map */}
          <div className="text-white">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-semibold">Our Location</h3>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4">
              <address className="text-slate-300 not-italic">
                Bahuda Block,<br />
                RGUKT Campus,<br />
                S.M Puram (Vi),<br />
                Etcherla (M),<br />
                Srikakulam Dist.,<br />
                Andhra Pradesh,<br />
                India - 532410
              </address>
              
              {/* Google Map */}
              <div className="h-60 md:w-1/2 rounded-lg overflow-hidden">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3806.7241858903223!2d83.8241618!3d18.2874019!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a3c13a7502ea7c5%3A0xcdddc1e72a25a7f5!2sBahuda+Block%2C+IIIT+Srikakulam!5e0!3m2!1sen!2sin!4v1708784072543!5m2!1sen!2sin"
                  className="w-full h-full border-0"
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="RGUKT Srikakulam Campus Map"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;