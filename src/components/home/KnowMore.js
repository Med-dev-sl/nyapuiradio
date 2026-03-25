import React, { useState } from 'react';

const KnowMore = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="relative w-full flex justify-end mt-12 pb-8">
      {/* Orange Arrow Button - Now Right-Aligned */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="group relative flex items-center justify-center size-16 md:size-24 bg-primary hover:bg-primary-dark rounded-full shadow-2xl shadow-primary/40 transition-all duration-500 hover:scale-110 active:scale-95 overflow-hidden z-20"
      >
        <span className="material-symbols-outlined text-white text-3xl md:text-5xl font-black group-hover:translate-x-2 transition-transform duration-500">arrow_forward</span>

        {/* Animated Glow Effect */}
        <div className="absolute inset-0 bg-white/30 translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
      </button>

      {/* Pulsing Ring for Attention - Orange */}
      <div className="absolute top-0 right-0 size-16 md:size-24 rounded-full border-4 border-primary/30 animate-ping z-10" />

      {/* Small Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-xl animate-in fade-in duration-300">
          <div
            className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[3rem] p-12 shadow-3xl border border-slate-100 dark:border-white/10 relative transform animate-in zoom-in slide-in-from-bottom-12 duration-500"
          >
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-8 right-8 size-12 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-2xl hover:bg-primary/10 transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-slate-400 text-sm">close</span>
            </button>

            <div className="text-center space-y-8">
              <div className="size-20 bg-primary/10 text-primary rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                <span className="material-symbols-outlined text-4xl font-black">info</span>
              </div>

              <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
                Want to know more about <span className="text-primary italic">Nyapui Radio</span>?
              </h3>

              <div className="pt-6">
                <a
                  href="#more"
                  className="inline-block px-10 py-5 bg-primary text-white font-black text-lg rounded-[1.5rem] shadow-xl shadow-primary/30 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all animate-bounce flex items-center justify-center gap-3"
                >
                  <span>CLICK HERE</span>
                  <span className="material-symbols-outlined font-black">arrow_outward</span>
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
