import React from 'react';

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

  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Programs', path: '/programs' },
    { name: 'News', path: '/news' },
    { name: 'Services', path: '/services' },
    { name: 'Community', path: '/community' },
    { name: 'Contact', path: '/contact' },
  ];

  const handleNavigation = (e, path) => {
    e.preventDefault();
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new Event('navigate'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="w-full bg-blue-950 text-white animate-slideUp border-t border-primary/20 relative overflow-hidden mt-auto">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-blue-900 to-blue-950 opacity-90 pointer-events-none"></div>
      
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Brand Info */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <img src="/logo512.png" alt="Nyapui Radio Logo" className="h-12 w-auto hover:scale-105 transition-transform duration-300" />
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent transform transition-transform hover:scale-105 cursor-pointer">
                Nyapui Radio
              </h2>
            </div>
            <p className="text-sm text-blue-200 leading-relaxed max-w-xs">
              Your voice, your station. Search <span className="font-semibold text-primary">@nyapuiradio</span> on all platforms to connect with us.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold border-b border-blue-700/50 pb-2 w-max text-blue-100">Quick Links</h3>
            <ul className="flex flex-col gap-2 text-sm text-blue-200">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.path}
                    onClick={(e) => handleNavigation(e, link.path)}
                    className="hover:text-primary transition-colors flex items-center gap-1 group"
                  >
                    <span className="material-symbols-outlined text-[14px] opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300">
                      arrow_right
                    </span>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Links */}
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold border-b border-blue-700/50 pb-2 w-max text-blue-100">Follow Us</h3>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex h-10 w-10 items-center justify-center rounded-full bg-blue-900 border border-blue-800 hover:bg-primary transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/30"
                  aria-label={link.name}
                  title={`@nyapuiradio on ${link.name}`}
                >
                  <span className="material-symbols-outlined text-[20px] text-blue-200 group-hover:text-white transition-colors">
                    {link.icon}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold border-b border-blue-700/50 pb-2 w-max text-blue-100">Contact Us</h3>
            <ul className="flex flex-col gap-3 text-sm text-blue-200">
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
        
        <div className="mt-12 border-t border-blue-800/50 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-blue-300 gap-4">
          <p>&copy; {new Date().getFullYear()} Nyapui Radio. All Rights Reserved.</p>
          <div className="flex gap-4">
            <a href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-primary transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
