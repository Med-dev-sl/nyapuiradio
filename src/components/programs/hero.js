import React, { useState, useEffect } from 'react';

const images = ['/programs-her01.jpeg', '/programs-hero2.jpeg'];

const ProgramsHero = () => {
    const [currentIdx, setCurrentIdx] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIdx((prev) => (prev + 1) % images.length);
        }, 5000); // Delay between transitions

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative w-full h-[400px] md:h-[500px] bg-slate-950 overflow-hidden flex items-center justify-center">
            {/* Background Image Slider */}
            <div className="absolute inset-0 z-0">
                <div className="relative w-full h-full">
                    {images.map((img, i) => (
                        <img 
                            key={img}
                            src={img} 
                            alt={`Programs Hero ${i}`} 
                            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${i === currentIdx ? 'opacity-70' : 'opacity-0'} grayscale hover:grayscale-0 scale-105`}
                        />
                    ))}
                </div>
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

            {/* Industrial Decor and Slider Indicators */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4">
                {images.map((_, i) => (
                    <div 
                        key={i}
                        className={`h-1 transition-all duration-500 rounded-full ${i === currentIdx ? 'w-12 bg-primary' : 'w-4 bg-white/20'}`}
                    />
                ))}
            </div>

            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
            <div className="absolute top-0 right-0 p-12 opacity-5 hidden lg:block">
                <span className="material-symbols-outlined text-[200px] text-white">podcasts</span>
            </div>
        </div>
    );
};

export default ProgramsHero;
