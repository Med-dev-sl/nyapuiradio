import React from 'react';

const TopHeader = () => {
  return (
    <div className="w-full bg-blue-600 text-orange-500 py-4 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Desktop Layout */}
        <div className="hidden md:flex justify-between items-center gap-8">
          {/* Left - Address */}
          <div className="flex items-start gap-3 flex-1">
            <div className="text-2xl shrink-0">📍</div>
            <div className="flex flex-col">
              <p className="text-xs font-black uppercase tracking-widest text-orange-400">Address</p>
              <p className="text-sm font-bold text-white">4 Amie Jay Drive</p>
              <p className="text-sm font-bold text-white">Reservation Kenema</p>
            </div>
          </div>

          {/* Center - Email */}
          <div className="flex items-start gap-3 flex-1 justify-center">
            <div className="text-2xl shrink-0">✉️</div>
            <div className="flex flex-col text-center">
              <p className="text-xs font-black uppercase tracking-widest text-orange-400">Email</p>
              <a 
                href="mailto:info@nyapuiradio.com" 
                className="text-sm font-bold text-white hover:text-orange-200 transition-colors"
              >
                info@nyapuiradio.com
              </a>
            </div>
          </div>

          {/* Right - Contact */}
          <div className="flex items-start gap-3 flex-1 justify-end">
            <div className="text-2xl shrink-0">📱</div>
            <div className="flex flex-col text-right">
              <p className="text-xs font-black uppercase tracking-widest text-orange-400">Contact</p>
              <a 
                href="tel:+23276106106" 
                className="text-sm font-bold text-white hover:text-orange-200 transition-colors"
              >
                +232 76 106 106
              </a>
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden space-y-4">
          {/* Address */}
          <div className="flex items-start gap-3">
            <div className="text-xl shrink-0">📍</div>
            <div className="flex flex-col">
              <p className="text-xs font-black uppercase tracking-widest text-orange-400">Address</p>
              <p className="text-xs font-bold text-white">4 Amie Jay Drive, Reservation Kenema</p>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-start gap-3">
            <div className="text-xl shrink-0">✉️</div>
            <div className="flex flex-col">
              <p className="text-xs font-black uppercase tracking-widest text-orange-400">Email</p>
              <a 
                href="mailto:info@nyapuiradio.com" 
                className="text-xs font-bold text-white hover:text-orange-200 transition-colors break-all"
              >
                info@nyapuiradio.com
              </a>
            </div>
          </div>

          {/* Contact */}
          <div className="flex items-start gap-3">
            <div className="text-xl shrink-0">📱</div>
            <div className="flex flex-col">
              <p className="text-xs font-black uppercase tracking-widest text-orange-400">Contact</p>
              <a 
                href="tel:+23276106106" 
                className="text-xs font-bold text-white hover:text-orange-200 transition-colors"
              >
                +232 76 106 106
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopHeader;
