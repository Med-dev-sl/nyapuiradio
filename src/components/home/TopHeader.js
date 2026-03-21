import React from 'react';

const TopHeader = () => {
  return (
    <div className="w-full bg-blue-900 text-orange-500 py-4 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Desktop Layout */}
        <div className="hidden md:flex justify-between items-center gap-8">
          {/* Left - Address */}
          <div className="flex items-start gap-3 flex-1">
            <i className="material-symbols-outlined text-orange-500 text-2xl shrink-0" style={{fontSize: '28px', fontWeight: 'normal', fontStyle: 'normal', letterSpacing: 'normal', textTransform: 'none', whiteSpace: 'nowrap', wordWrap: 'normal', direction: 'ltr'}}>location_on</i>
            <div className="flex flex-col">
              <p className="text-xs font-black uppercase tracking-widest text-orange-400">Address</p>
              <p className="text-sm font-bold text-white">4 Amie Jay Drive</p>
              <p className="text-sm font-bold text-white">Reservation Kenema</p>
            </div>
          </div>

          {/* Center - Email */}
          <div className="flex items-start gap-3 flex-1 justify-center">
            <i className="material-symbols-outlined text-orange-500 text-2xl shrink-0" style={{fontSize: '28px', fontWeight: 'normal', fontStyle: 'normal', letterSpacing: 'normal', textTransform: 'none', whiteSpace: 'nowrap', wordWrap: 'normal', direction: 'ltr'}}>mail</i>
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
            <i className="material-symbols-outlined text-orange-500 text-2xl shrink-0" style={{fontSize: '28px', fontWeight: 'normal', fontStyle: 'normal', letterSpacing: 'normal', textTransform: 'none', whiteSpace: 'nowrap', wordWrap: 'normal', direction: 'ltr'}}>phone</i>
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
            <i className="material-symbols-outlined text-orange-500 text-xl shrink-0" style={{fontSize: '24px', fontWeight: 'normal', fontStyle: 'normal', letterSpacing: 'normal', textTransform: 'none', whiteSpace: 'nowrap', wordWrap: 'normal', direction: 'ltr'}}>location_on</i>
            <div className="flex flex-col">
              <p className="text-xs font-black uppercase tracking-widest text-orange-400">Address</p>
              <p className="text-xs font-bold text-white">4 Amie Jay Drive, Reservation Kenema</p>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-start gap-3">
            <i className="material-symbols-outlined text-orange-500 text-xl shrink-0" style={{fontSize: '24px', fontWeight: 'normal', fontStyle: 'normal', letterSpacing: 'normal', textTransform: 'none', whiteSpace: 'nowrap', wordWrap: 'normal', direction: 'ltr'}}>mail</i>
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
            <i className="material-symbols-outlined text-orange-500 text-xl shrink-0" style={{fontSize: '24px', fontWeight: 'normal', fontStyle: 'normal', letterSpacing: 'normal', textTransform: 'none', whiteSpace: 'nowrap', wordWrap: 'normal', direction: 'ltr'}}>phone</i>
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
