import React, { useState, useEffect } from 'react';

const FABubble = () => {
  const [isDark, setIsDark] = useState(
    localStorage.getItem('theme') === 'dark' || 
    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <div className="fixed bottom-8 right-8 z-[9999] flex flex-col items-center gap-4 group">
      {/* Tooltip Label */}
      <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 pointer-events-none">
        <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-bold px-3 py-1.5 rounded-full shadow-xl uppercase tracking-widest border border-white/10 dark:border-slate-200">
          {isDark ? 'Switch to Light' : 'Switch to Dark'}
        </div>
      </div>
      
      {/* Main Bubble */}
      <button
        onClick={toggleTheme}
        className={`relative size-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 hover:scale-110 active:scale-95 overflow-hidden border-2 ${
          isDark 
            ? 'bg-slate-900 border-slate-700 text-primary' 
            : 'bg-white border-slate-100 text-primary'
        }`}
        aria-label="Toggle Theme"
      >
        {/* Animated Background Glow */}
        <div className={`absolute inset-0 opacity-20 blur-xl transition-colors duration-500 bg-primary`} />
        
        {/* Animated Icons Container */}
        <div className={`relative transition-all duration-500 transform ${isDark ? 'rotate-[360deg]' : 'rotate-0'}`}>
          <span className="material-symbols-outlined text-2xl">
            {isDark ? 'light_mode' : 'dark_mode'}
          </span>
        </div>

        {/* Floating Particles Effect (on hover) */}
        <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
           <div className="absolute top-1 left-2 size-1 bg-current rounded-full animate-ping" />
           <div className="absolute bottom-2 right-3 size-1 bg-current rounded-full animate-pulse blur-[1px]" />
        </div>
      </button>

      {/* Decorative pulse ring */}
      <div className={`absolute bottom-0 right-0 size-14 rounded-full border-2 animate-ping opacity-20 pointer-events-none border-primary`} style={{ animationDuration: '3s' }} />
    </div>
  );
};

export default FABubble;
