import React from 'react';
import logo from '../logo.svg';

const Footer = () => {
  const socialLinks = [
    { name: 'YouTube', icon: 'smart_display', url: 'https://youtube.com/@nyapuiradio' },
    { name: 'Facebook', icon: 'facebook', url: 'https://facebook.com/nyapuiradio' },
    { name: 'Instagram', icon: 'camera_alt', url: 'https://instagram.com/nyapuiradio' },
    { name: 'WhatsApp', icon: 'chat', url: 'https://wa.me/23276106106' },
    { name: 'TikTok', icon: 'music_note', url: 'https://tiktok.com/@nyapuiradio' },
    { name: 'LinkedIn', icon: 'work', url: 'https://linkedin.com/company/nyapuiradio' },
    { name: 'X', icon: 'close', url: 'https://x.com/nyapuiradio' },
  ];

  return (
    <footer className="w-full bg-slate-900 text-white animate-slideUp border-t border-primary/20 relative overflow-hidden mt-auto">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 opacity-80 pointer-events-none"></div>
      
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          
          {/* Brand Info */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Nyapui Radio Logo" className="h-12 w-auto hover:scale-105 transition-transform duration-300" />
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent transform transition-transform hover:scale-105 cursor-pointer">
                Nyapui Radio
              </h2>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
              Your voice, your station. Search <span className="font-semibold text-primary">@nyapuiradio</span> on all platforms to connect with us.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold border-b border-slate-700 pb-2 w-max text-slate-200">Follow Us</h3>
            <div className="flex flex-wrap gap-4">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 border border-slate-700 hover:bg-primary transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/30"
                  aria-label={link.name}
                  title={`@nyapuiradio on ${link.name}`}
                >
                  <span className="material-symbols-outlined text-[20px] text-slate-300 group-hover:text-white transition-colors">
                    {link.icon}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold border-b border-slate-700 pb-2 w-max text-slate-200">Contact Us</h3>
            <ul className="flex flex-col gap-3 text-sm text-slate-300">
              <li className="flex items-center gap-3 group">
                <span className="material-symbols-outlined text-[18px] text-primary group-hover:scale-110 transition-transform">mail</span>
                <a href="mailto:info@nyapuiradio.com" className="hover:text-white transition-colors">info@nyapuiradio.com</a>
              </li>
              <li className="flex items-center gap-3 group">
                <span className="material-symbols-outlined text-[18px] text-primary group-hover:scale-110 transition-transform">language</span>
                <a href="https://www.nyapuiradio.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">www.nyapuiradio.com</a>
              </li>
              <li className="flex items-center gap-3 group">
                <span className="material-symbols-outlined text-[18px] text-primary group-hover:scale-110 transition-transform">phone</span>
                <a href="tel:+23276106106" className="hover:text-white transition-colors">+232 76 106106</a>
              </li>
            </ul>
          </div>
          
        </div>
        
        <div className="mt-12 border-t border-slate-800 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <p>&copy; {new Date().getFullYear()} Nyapui Radio. All Rights Reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
