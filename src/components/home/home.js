import { useEffect, useState } from 'react';
import CenteredLogo from '../common/CenteredLogo';
import HeaderMenu from './HeaderMenu';
import Hero from './Hero';


const TypewriterEffect = ({ phrases, onFinished }) => {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    if (phraseIndex >= phrases.length) return;

    const currentPhrase = phrases[phraseIndex].text;
    if (displayedText.length < currentPhrase.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(currentPhrase.slice(0, displayedText.length + 1));
      }, phrases[phraseIndex].speed || 100);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => {
        if (phraseIndex < phrases.length - 1) {
          setPhraseIndex(phraseIndex + 1);
          setDisplayedText("");
        } else {
          setIsTyping(false);
          onFinished?.();
        }
      }, phrases[phraseIndex].pause || 1000);
      return () => clearTimeout(timeout);
    }
  }, [displayedText, phraseIndex, phrases, onFinished]);

  return (
    <div className="flex flex-col items-center gap-2">
      <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">
        {phraseIndex === 0 ? displayedText : phrases[0].text}
        {phraseIndex === 0 && <span className="animate-pulse">|</span>}
      </h1>
      {(phraseIndex > 0 || !isTyping) && (
        <p className="text-xs md:text-sm font-bold tracking-[0.3em] text-primary/60 dark:text-primary/40 uppercase text-center max-w-lg leading-relaxed">
          {phraseIndex === 1 ? displayedText : (phraseIndex > 1 ? phrases[1].text : "")}
          {phraseIndex === 1 && <span className="animate-pulse">|</span>}
        </p>
      )}
    </div>
  );
};

const Home = () => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-500">
      <header className="w-full pt-16 pb-12 border-b border-slate-200 dark:border-primary/20 px-8 flex flex-col items-center justify-center relative overflow-hidden gap-8">
        {/* Background Glow for Orange Theme */}
        <div className="absolute top-0 right-0 size-96 bg-primary/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 size-64 bg-primary/5 blur-[100px] pointer-events-none" />

        <CenteredLogo className="size-32 md:size-40 relative hover:scale-105 transition-transform duration-500 cursor-pointer" />

        <TypewriterEffect
          phrases={[
            { text: "Nyapui Radio", speed: 150, pause: 800 },
            { text: "Transparency, Accountability, Equity and Voice for Women", speed: 50, pause: 2000 }
          ]}
          onFinished={() => setShowMenu(true)}
        />
      </header>
      <div className={`transition-all duration-1000 ${showMenu ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        <HeaderMenu />
        <Hero />

        <main className="flex-1 p-8 flex flex-col items-center justify-center gap-12 relative">
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
    </div>
  );
};

export default Home;
