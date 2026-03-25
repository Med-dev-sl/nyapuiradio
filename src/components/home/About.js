import React, { useEffect, useState, useRef } from 'react';

const About = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const currentSectionRef = sectionRef.current;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (currentSectionRef) {
      observer.observe(currentSectionRef);
    }

    return () => {
      if (currentSectionRef) {
        observer.unobserve(currentSectionRef);
      }
    };
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="w-full max-w-7xl mx-auto py-24 px-8 overflow-hidden"
    >
      <div className="flex flex-col md:flex-row items-center gap-16 md:gap-24">
        
        {/* Photo on the Left */}
        <div className={`relative flex-1 transition-all duration-1000 transform ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-20 opacity-0'}`}>
          {/* Decorative Circle Shapes */}
          <div className="absolute -top-10 -left-10 size-40 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-10 -right-10 size-60 bg-primary/5 rounded-full blur-3xl" />
          
          <div className="relative rounded-[3rem] overflow-hidden border-8 border-white dark:border-slate-800 shadow-2xl rotate-[-2deg] hover:rotate-0 transition-transform duration-700 group">
             <img 
               src="/about.jpeg" 
               alt="About Nyapui Radio" 
               className="w-full h-[500px] object-cover group-hover:scale-110 transition-transform duration-1000"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>

          {/* Shooting Arrow Style element */}
          <div className={`absolute -right-12 top-1/2 -translate-y-1/2 z-10 transition-all duration-1000 delay-500 transform ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}`}>
             <div className="flex items-center">
                <div className="size-16 bg-primary rounded-full flex items-center justify-center shadow-xl shadow-primary/30 border-4 border-white dark:border-slate-900">
                   <span className="material-symbols-outlined text-white text-3xl font-bold animate-ping absolute opacity-50">arrow_forward</span>
                   <span className="material-symbols-outlined text-white text-3xl font-bold">arrow_forward</span>
                </div>
                <div className="h-1 w-24 bg-gradient-to-r from-primary to-transparent rounded-full -ml-1" />
             </div>
          </div>
        </div>

        <div className="flex-1 space-y-8">
          <div className={`transition-all duration-1000 delay-300 transform ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-20 opacity-0'}`}>
            <h4 className="text-primary font-black uppercase tracking-[0.3em] text-sm mb-4">Our Journey</h4>
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white leading-tight uppercase tracking-tight">
              Amplifying <span className="text-primary">Voice</span>,<br /> 
              Inspiring <span className="text-primary">Change</span>
            </h2>
          </div>

          <div className={`space-y-6 transition-all duration-1000 delay-500 transform ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-20 opacity-0'}`}>
            <p className="text-xl text-slate-600 dark:text-slate-300 font-medium leading-relaxed italic border-l-4 border-primary pl-6">
              "Nyapui Radio is not just a frequency; it is a movement dedicated to transparency, accountability, and the socio-economic empowerment of women."
            </p>
            <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
              Established as a beacon of hope, we broadcast local and international stories that matter. Our platform serves as a bridge for the voiceless, ensuring that every woman's story is heard, every community issue is addressed, and every listener is empowered through music, news, and advocacy.
            </p>
          </div>

          <div className={`pt-6 transition-all duration-1000 delay-700 transform ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-20 opacity-0'}`}>
            <div className="flex flex-wrap gap-4">
               <div className="px-6 py-4 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-primary/10 flex items-center gap-4">
                  <div className="size-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined font-bold">diversity_3</span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Community</div>
                    <div className="font-black text-slate-900 dark:text-white">Equity & Voice</div>
                  </div>
               </div>
               <div className="px-6 py-4 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-primary/10 flex items-center gap-4">
                  <div className="size-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined font-bold">verified_user</span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Integrity</div>
                    <div className="font-black text-slate-900 dark:text-white">Accountability</div>
                  </div>
               </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default About;
