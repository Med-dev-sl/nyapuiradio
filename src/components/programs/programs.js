import React, { useEffect, useState, useRef } from 'react';
import API_URL from '../../config';
import HeaderMenu from '../home/HeaderMenu';
import CenteredLogo from '../common/CenteredLogo';

const FullPrograms = () => {
    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef(null);

    useEffect(() => {
        // Scroll to top on mount
        window.scrollTo(0, 0);

        const fetchPrograms = async () => {
            try {
                const fullUrl = `${API_URL}/api/public/programs`;
                console.log('Fetching all programs from:', fullUrl);
                const response = await fetch(fullUrl);

                if (response.ok) {
                    const data = await response.json();
                    console.log('Successfully fetched all programs:', data);
                    if (Array.isArray(data)) {
                        setPrograms(data);
                    } else {
                        setPrograms([]);
                    }
                } else {
                    console.error('Failed to fetch programs:', response.status);
                }
            } catch (error) {
                console.error('Network Error fetching programs:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPrograms();

        // Immediate visibility for main container since it's a dedicated page
        setTimeout(() => setIsVisible(true), 100);
    }, []);

    const formatDays = (days) => {
        if (!days) return 'Daily';
        if (Array.isArray(days)) return days.join(', ');
        if (typeof days === 'string') {
            try {
                const parsed = JSON.parse(days);
                if (Array.isArray(parsed)) return parsed.join(', ');
            } catch (e) {
                return days.replace(/[[\]"]/g, '');
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
        <div className="min-h-screen bg-background-light dark:bg-background-dark transition-colors duration-500">
            {/* Header Mirroring Homepage Style */}
            <header className="w-full pt-12 pb-8 border-b border-slate-200 dark:border-primary/20 px-8 flex flex-col items-center justify-center relative overflow-hidden gap-6 bg-white dark:bg-slate-900">
                <div className="absolute top-0 right-0 size-96 bg-primary/5 blur-[120px] pointer-events-none" />
                <CenteredLogo className="size-24 md:size-32 relative hover:scale-105 transition-transform duration-500 cursor-pointer" />
                <div className="text-center">
                    <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                        Our <span className="text-primary">Program</span> Guide
                    </h1>
                </div>
            </header>

            <HeaderMenu />

            <main className="max-w-7xl mx-auto py-24 px-8 relative">
                <div className={`transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16 gap-4">
                        <div>
                            <h4 className="text-primary font-black uppercase tracking-[0.3em] text-sm mb-4">Complete Broadcast Registry</h4>
                            <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight uppercase tracking-tight">
                                Frequency & <span className="text-primary">Schedule</span>
                            </h2>
                        </div>
                        <div className="px-6 py-3 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-primary/10 flex items-center gap-4">
                            <span className="material-symbols-outlined text-primary">broadcast_tower</span>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Live Now</span>
                                <span className="text-xs font-black text-slate-900 dark:text-white uppercase">Nyapui Radio 102.3 FM</span>
                            </div>
                        </div>
                    </div>

                    {!loading && programs.length === 0 ? (
                        <div className="p-24 border border-dashed border-slate-200 dark:border-primary/20 text-center rounded-3xl">
                             <span className="material-symbols-outlined text-5xl text-slate-200 dark:text-primary/10 mb-4">radio</span>
                             <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs">More programs arriving soon. Stay tuned to Nyapui Radio.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 border-l border-t border-slate-200 dark:border-primary/20">
                            {(loading ? Array(8).fill({}) : programs).map((program, index) => (
                                <div 
                                    key={program.id || index}
                                    className={`group relative bg-white dark:bg-slate-950 border-r border-b border-slate-200 dark:border-primary/10 overflow-hidden rounded-none transition-all duration-1000 transform ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-[50px] opacity-0'} ${loading ? 'animate-pulse' : ''}`}
                                    style={{ 
                                        transitionDelay: `${index * 50}ms`,
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
                                        
                                        {!loading && (
                                            <div className="absolute top-0 right-0 bg-primary px-3 py-2 text-white text-[9px] font-black uppercase tracking-[0.2em] shadow-lg">
                                                {program.category}
                                            </div>
                                        )}
                                        
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    </div>
                    
                                    <div className="p-8 space-y-6">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 text-primary">
                                                <span className="material-symbols-outlined text-base">calendar_today</span>
                                                <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                                                    {loading ? 'Loading...' : formatDays(program.days)}
                                                </span>
                                            </div>
                                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase leading-tight group-hover:text-primary transition-colors duration-300">
                                                {loading ? 'Scheduled Program' : program.title}
                                            </h3>
                                        </div>
                    
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
                    
                                        {!loading && program.description && (
                                            <div className="border-l-2 border-primary/20 pl-4">
                                                <p className="text-slate-500 dark:text-slate-400 text-[12px] leading-relaxed line-clamp-3 italic font-medium">
                                                    "{program.description}"
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute bottom-0 left-0 h-1 w-full bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <footer className="py-8 text-center text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-primary/10 bg-slate-50 dark:bg-slate-950 font-bold uppercase tracking-[0.2em] text-[10px]">
                © {new Date().getFullYear()} Nyapui Radio • Empowering Voices
            </footer>
        </div>
    );
};

export default FullPrograms;
