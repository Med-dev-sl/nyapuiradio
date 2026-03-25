import React, { useState } from 'react';

const KnowMore = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="relative inline-block mt-8">
      {/* Blue Arrow Button */}
      <button 
        onClick={() => setIsModalOpen(true)}
        className="group relative flex items-center justify-center size-16 md:size-20 bg-blue-600 hover:bg-blue-700 rounded-full shadow-xl shadow-blue-500/30 transition-all duration-500 hover:scale-110 active:scale-95 overflow-hidden"
      >
        <span className="material-symbols-outlined text-white text-3xl md:text-4xl font-bold group-hover:translate-x-1 transition-transform">arrow_forward</span>
        
        {/* Animated Glow Effect */}
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
      </button>

      {/* Pulsing Ring for Attention */}
      <div className="absolute inset-0 rounded-full border-4 border-blue-500/30 animate-ping -z-10" />

      {/* Small Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-300">
          <div 
            className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 shadow-3xl border border-slate-100 dark:border-white/10 relative transform animate-in zoom-in slide-in-from-bottom-12 duration-500"
          >
            {/* Close Button */}
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 size-10 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-primary/10 transition-colors"
            >
              <span className="material-symbols-outlined text-slate-500 text-sm">close</span>
            </button>

            <div className="text-center space-y-6">
              <div className="size-16 bg-blue-100 dark:bg-blue-900/40 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-outlined text-3xl font-bold">info</span>
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-relaxed">
                Do you want to know more about <span className="text-primary italic">Nyapui Radio</span>?
              </h3>

              <div className="pt-4">
                <a 
                  href="#more" 
                  className="inline-block px-8 py-4 bg-primary text-white font-black rounded-2xl shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-all animate-bounce"
                >
                  CLICK HERE
                </a>
              </div>
            </div>
          </div>
          
          {/* Close modal by clicking backdrop */}
          <div className="absolute inset-0 -z-10" onClick={() => setIsModalOpen(false)} />
        </div>
      )}
    </div>
  );
};

export default KnowMore;
