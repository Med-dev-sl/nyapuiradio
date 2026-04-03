import React from 'react';

const ServerError = () => {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center animate-slideDown">
      <div className="relative mb-6">
        <img src="/logo512.png" alt="Nyapui Radio" className="w-24 h-24 sm:w-32 sm:h-32 opacity-80 filter grayscale" />
        <div className="absolute -bottom-4 -right-4 bg-red-100 dark:bg-slate-800 rounded-full p-2 animate-pulse-slow">
          <span className="material-symbols-outlined text-red-500 text-2xl sm:text-3xl">error</span>
        </div>
      </div>
      
      <h1 className="text-7xl sm:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-800 mb-4 opacity-90 drop-shadow-md">
        500
      </h1>
      <h2 className="text-2xl sm:text-4xl font-bold text-slate-800 dark:text-white mb-4">
        Internal Server Error
      </h2>
      <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto leading-relaxed">
        We're experiencing some technical difficulties on our end. Our engineers are investigating the signal loss.
      </p>
      <button 
        onClick={handleRetry}
        className="px-8 py-3.5 rounded-full bg-slate-800 dark:bg-slate-700 hover:bg-slate-950 dark:hover:bg-slate-600 text-white font-semibold transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex items-center gap-2 mx-auto"
      >
        <span className="material-symbols-outlined text-xl">refresh</span>
        Try Again
      </button>
    </div>
  );
};

export default ServerError;
