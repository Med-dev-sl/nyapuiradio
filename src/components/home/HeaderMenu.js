import React, { useState } from 'react';

const HeaderMenu = () => {
  const [active, setActive] = useState('Home');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [newsOpen, setNewsOpen] = useState(false);

  const items = ['Home', 'About', 'Programs', 'News', 'Services', 'Community', 'Contact'];
  const newsSubItems = ['Local', 'International'];

  const handleItemClick = (item) => {
    if (item === 'News') {
      setNewsOpen((prev) => !prev);
      setActive('News');
    } else {
      setActive(item);
      setNewsOpen(false);
      if (mobileOpen) setMobileOpen(false);
    }
  };

  return (
    <nav className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-primary/20 animate-slideDown shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-8">
        <button
          className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-primary dark:border-slate-700 dark:bg-slate-900 dark:text-white md:hidden"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-expanded={mobileOpen}
          aria-label="Toggle menu"
        >
          ☰ Menu
        </button>

        <ul className={`items-center gap-6 text-sm font-semibold md:flex ${mobileOpen ? 'flex flex-col' : 'hidden'} md:flex`}>
          {items.map((item) => {
            const isActive = active === item;
            const base = 'relative cursor-pointer px-3 py-2 transition-all duration-150 text-slate-700 dark:text-white';
            const activeClass = isActive ? 'text-primary' : 'hover:text-primary';

            return (
              <li key={item} className="relative group">
                <button
                  type="button"
                  onClick={() => handleItemClick(item)}
                  className={`${base} ${activeClass} ${isActive ? 'font-bold' : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                  aria-expanded={item === 'News' ? newsOpen : undefined}
                >
                  {item}
                  <span 
                    className={`material-symbols-outlined text-[10px] ml-1.5 align-middle transition-all duration-300 inline-block ${
                      isActive 
                        ? 'opacity-100 translate-x-0' 
                        : 'opacity-0 -translate-x-3 group-hover:opacity-100 group-hover:translate-x-0'
                    }`}
                  >
                    arrow_forward
                  </span>
                  <span
                    className={`absolute left-0 -bottom-1 h-[2px] bg-primary transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {newsOpen && (
        <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-primary/20">
          <ul className="mx-auto flex max-w-6xl flex-col md:flex-row md:gap-4 px-4 py-2">
            {newsSubItems.map((sub) => (
              <li key={sub}>
                <button
                  type="button"
                  onClick={() => {
                    setActive('News');
                    setNewsOpen(false);
                    if (mobileOpen) setMobileOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary"
                >
                  {sub}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
};

export default HeaderMenu;
