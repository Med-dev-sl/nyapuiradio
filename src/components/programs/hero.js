import React from 'react';

const ProgramsHero = () => {
    return (
        <div className="relative w-full h-[400px] md:h-[500px] bg-slate-950 overflow-hidden flex items-center justify-center">
            {/* Background Image Placeholder */}
            <div className="absolute inset-0 z-0">
                <img 
                    src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2070&auto=format&fit=crop" 
                    alt="Programs Hero Background" 
                    className="w-full h-full object-cover opacity-30 grayscale hover:grayscale-0 transition-all duration-1000 scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-transparent to-slate-950/90" />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/40 via-transparent to-slate-950/40" />
            </div>

            {/* Content Container */}
            <div className="relative z-10 text-center px-8 max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="flex justify-center mb-6">
                    <div className="px-5 py-2 bg-primary/20 backdrop-blur-md rounded-2xl border border-primary/30 flex items-center gap-3">
                        <div className="size-2 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(249,115,22,0.8)]" />
                        <span className="text-[10px] md:text-xs font-black text-primary uppercase tracking-[0.4em]">Live Radio Experience</span>
                    </div>
                </div>

                <h1 className="text-5xl md:text-8xl font-black text-white leading-none uppercase tracking-tighter mb-6 drop-shadow-2xl">
                    Broadcast <span className="text-primary decoration-primary underline-offset-8">Schedule</span>
                </h1>
                
                <p className="text-slate-400 text-sm md:text-xl font-bold uppercase tracking-[0.2em] leading-relaxed max-w-2xl mx-auto border-y border-white/10 py-6">
                    Transparency, Accountability, Equity • The official voice for women and the community.
                </p>

                <div className="mt-10 flex flex-wrap justify-center gap-6">
                    <div className="flex items-center gap-2 group cursor-default">
                        <div className="size-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:border-primary/40 transition-all">
                            <span className="material-symbols-outlined text-primary text-sm">schedule</span>
                        </div>
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">24/7 Transmission</span>
                    </div>
                    <div className="flex items-center gap-2 group cursor-default">
                        <div className="size-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:border-primary/40 transition-all">
                            <span className="material-symbols-outlined text-primary text-sm">language</span>
                        </div>
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Global Reach</span>
                    </div>
                </div>
            </div>

            {/* Industrial Decor */}
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
            <div className="absolute top-0 right-0 p-12 opacity-5 hidden lg:block">
                <span className="material-symbols-outlined text-[200px] text-white">podcasts</span>
            </div>
        </div>
    );
};

export default ProgramsHero;
