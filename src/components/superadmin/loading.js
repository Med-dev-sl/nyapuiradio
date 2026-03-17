import React from 'react';
import Logo from '../common/Logo';

const Loading = ({ message = "Syncing Experience..." }) => {
  return (
    <div className="fixed inset-0 z-[200] bg-background-dark/95 backdrop-blur-md flex flex-col items-center justify-center overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/10 rounded-full blur-[80px] animate-bounce duration-[3000ms]" />

      <div className="relative">
        {/* Animated Rings */}
        <div className="absolute inset-0 -m-8 border-2 border-primary/30 rounded-full animate-[spin_3s_linear_infinite]" />
        <div className="absolute inset-0 -m-12 border border-primary/10 rounded-full animate-[spin_5s_linear_infinite_reverse]" />
        <div className="absolute inset-0 -m-4 border-4 border-t-primary border-r-transparent border-b-primary/50 border-l-transparent rounded-full animate-[spin_1.5s_ease-in-out_infinite]" />

        {/* Logo Container */}
        <div className="relative z-10 size-32 md:size-40 flex items-center justify-center bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden group">
          <Logo className="size-full bg-transparent border-none p-4" />
          
          {/* Scanning Effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/20 to-transparent h-1/2 w-full -translate-y-full animate-[scan_2s_linear_infinite]" />
        </div>
      </div>

      {/* Text Elements */}
      <div className="mt-16 text-center">
        <h2 className="text-2xl font-black text-white tracking-[0.2em] uppercase mb-2 animate-pulse">
          Nyapui Radio
        </h2>
        <div className="flex items-center justify-center gap-1.5">
          <span className="size-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
          <span className="size-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
          <span className="size-1.5 bg-primary rounded-full animate-bounce" />
        </div>
        <p className="mt-4 text-slate-400 text-xs font-bold tracking-widest uppercase opacity-70">
          {message}
        </p>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(200%); }
        }
      `}} />
    </div>
  );
};

export default Loading;
