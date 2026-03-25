import React, { useState, useEffect } from 'react';

const Hero = () => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [nextIdx, setNextIdx] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);

  const images = ['/hero1.jpeg', '/hero2.jpeg'];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIdx((prev) => (prev + 1) % images.length);
        setNextIdx((prev) => (prev + 1) % images.length);
        setIsAnimating(false);
      }, 1500); // Transition duration
    }, 7000); // Delay between transitions

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-[600px] md:h-[800px] overflow-hidden bg-slate-900">
      {/* Image Layers */}
      <div className="absolute inset-0 z-0">
        {/* Current Image */}
        <img
          src={images[currentIdx]}
          alt="Hero Current"
          className="absolute inset-0 w-full h-full object-cover brightness-[0.7] transform scale-110"
          style={{ transition: 'transform 8s linear' }}
        />
        
        {/* Next Image with Clipping Animation */}
        <div 
          className="absolute inset-0 z-10 transition-all duration-[1500ms] ease-in-out"
          style={{ 
            clipPath: isAnimating 
              ? 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' 
              : 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)'
          }}
        >
          <img
            src={images[nextIdx]}
            alt="Hero Next"
            className="w-full h-full object-cover brightness-[0.7]"
          />
        </div>
      </div>

      {/* Overlays as per user's request */}
      {/* Black Edge Overlay - Left Focused */}
      <div className="absolute inset-y-0 left-0 w-full md:w-[65%] z-20 bg-gradient-to-r from-black via-black/60 to-transparent pointer-events-none" />
      
      {/* Orange Soft Edge Overlay - The Left focus as requested */}
      <div className="absolute inset-y-0 left-0 w-[40%] z-30 pointer-events-none overflow-hidden">
        {/* Bright orange blur edge */}
        <div className="absolute -left-[200px] top-1/2 -translate-y-1/2 w-[600px] h-[800px] bg-[#f97316]/20 rounded-full blur-[150px]" />
        {/* Vertical orange highlight bar */}
        <div className="absolute inset-y-20 left-0 w-1.5 bg-gradient-to-b from-transparent via-[#f97316] to-transparent opacity-80" />
      </div>

      {/* Text Overlay Content */}
      <div className="relative h-full flex items-center z-40 px-8 md:px-24 max-w-5xl">
        <div className="space-y-8 max-w-2xl">
          <div className="space-y-2">
             <div className="inline-block px-4 py-1.5 bg-[#f97316] text-[10px] font-black tracking-[0.4em] text-white rounded-full mb-4 animate-bounce">
                ON AIR NOW
             </div>
             <h1 className="text-6xl md:text-[90px] font-black text-white leading-[0.9] uppercase tracking-tighter">
                Welcome to<br />
                <span className="text-[#f97316] drop-shadow-[0_0_30px_rgba(249,115,22,0.4)]">Nyapui Radio</span>
             </h1>
          </div>
          
          <div className="relative group">
            <p className="text-xl md:text-2xl text-slate-100 font-medium max-w-xl leading-relaxed pl-10 border-l-[6px] border-[#f97316]">
              Voice of the community, empowering local and international stories through music, news, and events.
              <span className="block mt-4 text-slate-300 text-base md:text-lg">Transparency, Accountability, Equity and Voice for Women.</span>
            </p>
          </div>

          <div className="flex flex-wrap gap-8 pt-6">
            <button className="px-12 py-5 bg-[#f97316] hover:bg-[#ea580c] text-white font-black text-xl rounded-2xl transition-all hover:scale-105 hover:rotate-[-1deg] shadow-[0_20px_50px_rgba(249,115,22,0.3)] group flex items-center gap-4">
               <span>Listen Now</span>
               <div className="size-8 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-all">
                  <div className="size-3 bg-white rounded-full animate-pulse" />
               </div>
            </button>
            <button className="px-12 py-5 bg-white/5 backdrop-blur-xl border-2 border-white/20 hover:bg-white/10 text-white font-black text-xl rounded-2xl transition-all hover:scale-105 active:scale-95">
               Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Decorative Slide Progress Overlay */}
      <div className="absolute bottom-12 left-8 md:left-24 z-40 flex items-center gap-8">
         <div className="flex gap-4">
            {images.map((_, i) => (
              <div 
                key={i}
                className={`h-2 transition-all duration-700 rounded-full ${i === currentIdx ? 'w-16 bg-[#f97316]' : 'w-8 bg-white/10'}`}
              />
            ))}
         </div>
         <div className="text-white/30 text-xs font-black tracking-[0.4em] uppercase">
            EST. 2024 • THE VOICE
         </div>
      </div>
    </div>
  );
};

export default Hero;


