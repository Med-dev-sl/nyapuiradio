import React from 'react';

const NotFound = () => {
  const handleHome = () => {
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new Event('navigate'));
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center animate-slideDown">
      <div className="relative mb-6">
        <img src="/logo512.png" alt="Nyapui Radio" className="w-24 h-24 sm:w-32 sm:h-32 animate-pulse-slow" />
        <div className="absolute -bottom-4 -right-4 bg-orange-100 dark:bg-slate-800 rounded-full p-2 animate-bounce">
          <span className="material-symbols-outlined text-primary text-2xl sm:text-3xl">question_mark</span>
        </div>
      </div>
      
      <h1 className="text-7xl sm:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400 mb-4 opacity-90 drop-shadow-md">
        404
      </h1>
      <h2 className="text-2xl sm:text-4xl font-bold text-slate-800 dark:text-white mb-4">
        Page Not Found
      </h2>
      <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto leading-relaxed">
        Oops! The page you are looking for seems to have gone off the air. Let's get you back to the main broadcast.
      </p>
      <button 
        onClick={handleHome}
        className="px-8 py-3.5 rounded-full bg-primary hover:bg-orange-600 text-white font-semibold transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/30 flex items-center gap-2 mx-auto"
      >
        <span className="material-symbols-outlined text-xl">home</span>
        Return Home
      </button>
    </div>
  );
};

export default NotFound;
