import React, { useState, useEffect } from 'react';

const Offline = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checkConnection = () => {
    setIsChecking(true);
    setTimeout(() => {
      if (navigator.onLine) {
        window.location.reload();
      } else {
        setIsChecking(false);
      }
    }, 1500);
  };

  if (isOnline) {
    // If we're online and this component is rendered manually, 
    // it's good to give them a way out.
    setTimeout(() => window.location.reload(), 1000);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center animate-slideDown">
      <div className="relative mb-6">
        <img src="/logo512.png" alt="Nyapui Radio" className="w-24 h-24 sm:w-32 sm:h-32 opacity-40 filter grayscale" />
        <div className="absolute inset-0 m-auto flex items-center justify-center z-20">
           <div className="bg-slate-100 dark:bg-slate-800 rounded-full p-4 animate-pulse shadow-md">
             <span className="material-symbols-outlined text-4xl sm:text-5xl text-slate-500">wifi_off</span>
           </div>
        </div>
      </div>
      
      <h1 className="text-5xl sm:text-7xl font-black text-slate-300 dark:text-slate-700 mb-4 opacity-90 drop-shadow-sm">
        Offline
      </h1>
      <h2 className="text-2xl sm:text-4xl font-bold text-slate-800 dark:text-white mb-4">
        No Network Connectivity
      </h2>
      <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto leading-relaxed">
        It seems you've lost connection to the internet. Please check your network cables, Wi-Fi, or cellular data and try reconnecting to resume the broadcast.
      </p>
      <button 
        onClick={checkConnection}
        disabled={isChecking}
        className="px-8 py-3.5 rounded-full bg-primary hover:bg-orange-600 disabled:opacity-70 disabled:hover:translate-y-0 text-white font-semibold transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/30 flex items-center gap-2 mx-auto"
      >
        <span className={`material-symbols-outlined text-xl ${isChecking ? 'animate-spin' : ''}`}>
          {isChecking ? 'autorenew' : 'wifi_find'}
        </span>
        {isChecking ? 'Checking...' : 'Retry Connection'}
      </button>
    </div>
  );
};

export default Offline;
