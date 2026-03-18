import React from 'react';
import Logo from '../common/Logo';

const Home = () => {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 flex flex-col">
      <header className="w-full py-6 shadow-sm border-b border-slate-200 dark:border-slate-800 px-8 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Logo className="size-10" />
          <h1 className="text-3xl font-bold">Nyapui Radio</h1>
        </div>
        <button
          onClick={() => { window.location.href = '/superadmin'; }}
          className="px-6 py-2 bg-primary text-white font-bold rounded-lg"
        >
          Superadmin Login
        </button>
      </header>

      <main className="flex-1 p-8 flex flex-col items-center justify-center gap-8">
        <div className="max-w-4xl text-center">
          <h2 className="text-5xl font-black mb-4">Welcome to Nyapui Radio</h2>
          <p className="text-lg text-slate-600 dark:text-slate-300">Voice of the community, empowering local and international stories through music, news, events, and more.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
            <h3 className="text-xl font-bold mb-2">Local News</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">In-depth community coverage with trending local headlines.</p>
          </div>
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
            <h3 className="text-xl font-bold mb-2">International News</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Global headlines from trusted partners, delivered in real time.</p>
          </div>
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
            <h3 className="text-xl font-bold mb-2">Podcasts & Programs</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Explore shows, podcasts, and video content from the station's rich lineup.</p>
          </div>
        </div>

        <div className="w-full max-w-2xl text-center text-sm text-slate-600 dark:text-slate-400">
          <p>For administration, click the Superadmin Login button above. For public content, continue as a listener through the mobile or web app experience.</p>
        </div>
      </main>

      <footer className="py-4 text-center text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800">© 2026 Nyapui Radio</footer>
    </div>
  );
};

export default Home;
