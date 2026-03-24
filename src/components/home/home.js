import React from 'react';
import CenteredLogo from '../common/CenteredLogo';
import HeaderMenu from './HeaderMenu';

const Home = () => {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-500">
      <header className="w-full py-12 shadow-sm border-b border-slate-200 dark:border-primary/20 px-8 flex justify-center items-center relative overflow-hidden">
        {/* Background Glow for Orange Theme */}
        <div className="absolute top-0 right-0 size-64 bg-primary/5 blur-[100px] pointer-events-none" />
        <CenteredLogo className="size-40 relative" />
      </header>
      <HeaderMenu />

      <main className="flex-1 p-8 flex flex-col items-center justify-center gap-12 relative">
        <div className="max-w-4xl text-center space-y-4">
          <h2 className="text-5xl md:text-6xl font-black mb-4 tracking-tight">
            Welcome to <span className="text-primary">Nyapui Radio</span>
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-medium">
            Voice of the community, empowering local and international stories through music, news, events, and more.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
          <div className="p-8 bg-white dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200 dark:border-primary/20 rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 size-24 bg-primary/5 dark:bg-primary/10 rounded-full blur-2xl -mr-8 -mt-8 group-hover:bg-primary/20 transition-all" />
            <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">Local News</h3>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">In-depth community coverage with trending local headlines that matter to you.</p>
          </div>
          <div className="p-8 bg-white dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200 dark:border-primary/20 rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 size-24 bg-primary/5 dark:bg-primary/10 rounded-full blur-2xl -mr-8 -mt-8 group-hover:bg-primary/20 transition-all" />
            <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">International</h3>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">Global headlines from trusted partners, delivered in real time for a global perspective.</p>
          </div>
          <div className="p-8 bg-white dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200 dark:border-primary/20 rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 size-24 bg-primary/5 dark:bg-primary/10 rounded-full blur-2xl -mr-8 -mt-8 group-hover:bg-primary/20 transition-all" />
            <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">Podcasts</h3>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">Explore shows, podcasts, and video content from the station's rich and diverse lineup.</p>
          </div>
        </div>

        <div className="w-full max-w-2xl text-center text-sm text-slate-500 dark:text-slate-400 pb-12">
          <p className="px-8 border-l-2 border-primary/30 italic">Explore our content through the mobile or web app experience. Enjoy local and international news, podcasts, and programs.</p>
        </div>
      </main>

      <footer className="py-8 text-center text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-primary/10 bg-slate-50 dark:bg-slate-950 font-bold uppercase tracking-[0.2em] text-[10px]">
        © {new Date().getFullYear()} Nyapui Radio • Empowering Voices
      </footer>
    </div>
  );
};

export default Home;
