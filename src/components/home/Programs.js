import React, { useEffect, useState, useRef } from 'react';
import API_URL from '../../config';

const Programs = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await fetch(`${API_URL}/api/public/programs`);
        if (response.ok) {
          const data = await response.json();
          // Take only the first 4
          setPrograms(data.slice(0, 4));
        } else {
          console.error('Failed to fetch programs:', response.status);
        }
      } catch (error) {
        console.error('Error fetching programs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.05 }
    );

    const currentSectionRef = sectionRef.current;
    if (currentSectionRef) {
      observer.observe(currentSectionRef);
    }

    return () => {
      if (currentSectionRef) {
        observer.unobserve(currentSectionRef);
      }
    };
  }, []);

  const formatDays = (days) => {
    if (!days) return 'Daily';
    if (Array.isArray(days)) return days.join(', ');
    if (typeof days === 'string') {
        try {
            const parsed = JSON.parse(days);
            if (Array.isArray(parsed)) return parsed.join(', ');
        } catch (e) {
            return days.replace(/[[\]"]/g, ''); // Basic cleanup for stringified array
        }
    }
    return days;
  };

  const getCategoryIcon = (category) => {
    const map = {
        'News & Current Affairs': 'newspaper',
        'Music & Entertainment': 'music_note',
        'Talk Shows': 'mic',
        'Sports': 'sports_soccer',
        'Education': 'school',
        'Health & Wellness': 'health_and_safety',
        'Religion & Spirituality': 'brightness_7',
        'Community': 'diversity_3',
        'Politics': 'policy',
        'Business & Finance': 'paid',
        'Technology': 'devices',
        'Culture & Arts': 'palette',
        'Youth Programs': 'groups',
        'Women\'s Programs': 'female',
        'Children\'s Programs': 'child_care',
        'Documentary': 'movie',
        'Live Events': 'live_tv',
        'Interviews': 'record_voice_over'
    };
    return map[category] || 'radio';
  };

  return (
    <section 
      ref={sectionRef} 
      className="w-full max-w-7xl mx-auto py-24 px-8 overflow-x-hidden relative min-h-[600px]"
      id="programs-section"
    >
      <div className={`transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
        <h4 className="text-primary font-black uppercase tracking-[0.3em] text-sm mb-4">Our Schedule</h4>
        <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white leading-tight uppercase tracking-tight mb-16">
          Radio <span className="text-primary">Programs</span>
        </h2>
      </div>

      {!loading && programs.length === 0 ? (
        <div className={`p-12 border border-dashed border-slate-200 dark:border-primary/20 text-center transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs">More programs arriving soon. Stay tuned to Nyapui Radio.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-l border-t border-slate-200 dark:border-primary/20">
          {(loading ? Array(4).fill({}) : programs).map((program, index) => (
            <div 
              key={program.id || index}
              className={`group relative bg-white dark:bg-slate-950 border-r border-b border-slate-200 dark:border-primary/10 overflow-hidden rounded-none transition-all duration-1000 transform ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-[100px] opacity-0'} ${loading ? 'animate-pulse' : ''}`}
              style={{ 
                transitionDelay: `${index * 150}ms`,
              }}
            >
              {/* Program image with hover zoom */}
              <div className="relative h-64 w-full overflow-hidden bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-primary/5">
                {!loading && program.image ? (
                  <img 
                    src={program.image} 
                    alt={program.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-primary/30 group-hover:text-primary transition-colors duration-500">
                    <span className="material-symbols-outlined text-7xl font-light scale-90 group-hover:scale-110 transition-transform duration-700">
                      {loading ? 'pending' : getCategoryIcon(program.category)}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest mt-4">Nyapui Radio</span>
                  </div>
                )}
                
                {/* Category Badge - Squared */}
                {!loading && (
                  <div className="absolute top-0 right-0 bg-primary px-3 py-2 text-white text-[9px] font-black uppercase tracking-[0.2em] shadow-lg">
                    {program.category}
                  </div>
                )}
                
                {/* Overlaid Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
  
              {/* Content Section */}
              <div className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-primary">
                    <span className="material-symbols-outlined text-base">calendar_today</span>
                    <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                      {loading ? 'Loading...' : formatDays(program.days)}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase leading-tight group-hover:text-primary transition-colors duration-300">
                    {loading ? 'Scheduled Program' : program.title}
                  </h3>
                </div>
  
                {/* Time Display - Industrial Style */}
                <div className="flex items-center justify-between py-4 border-y border-slate-100 dark:border-primary/5">
                  <div className="flex flex-col">
                    <span className="text-[8px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest leading-none mb-2">Starts</span>
                    <span className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2 font-mono">
                      <span className={`size-1 bg-primary ${loading ? '' : 'animate-pulse'}`} />
                      {loading ? '--:--' : program.start_time}
                    </span>
                  </div>
                  <div className="h-4 w-[2px] bg-slate-200 dark:bg-primary/30 rotate-12" />
                  <div className="flex flex-col items-end text-right">
                    <span className="text-[8px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest leading-none mb-2">Ends</span>
                    <span className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2 font-mono">
                      {loading ? '--:--' : program.end_time}
                      <span className="size-1 bg-slate-300 dark:bg-slate-700" />
                    </span>
                  </div>
                </div>
  
                {/* Description Section with squared border-l */}
                {!loading && program.description && (
                  <div className="border-l-2 border-primary/20 pl-4">
                    <p className="text-slate-500 dark:text-slate-400 text-[13px] leading-relaxed line-clamp-2 italic font-medium">
                      "{program.description}"
                    </p>
                  </div>
                )}
              </div>
  
              {/* Bottom Accent line - Industrial look */}
              <div className="absolute bottom-0 left-0 h-1 w-full bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left" />
            </div>
          ))}
        </div>
      )}
      
      {/* Background Text - Positioned carefully to avoid horizontal scroll */}
      <div className={`absolute right-0 bottom-4 text-9xl font-black text-slate-100 dark:text-white/[0.02] pointer-events-none transition-all duration-[2000ms] leading-none select-none ${isVisible ? 'translate-x-1/4 opacity-100' : 'translate-x-full opacity-0'}`}>
        PROGRAMS
      </div>
    </section>
  );
};

export default Programs;
