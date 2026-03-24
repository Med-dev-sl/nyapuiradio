import React, { useState } from 'react';

const HeaderMenu = () => {
  const [active, setActive] = useState('Home');
  const [mobileOpen, setMobileOpen] = useState(false);

  const items = ['Home', 'About', 'Programs', 'News', 'Contact'];
  const newsSubItems = ['Local', 'International'];

  return (
    <nav className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 animate-slideDown">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-8">
        <button
          className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-blue-300 md:hidden"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-expanded={mobileOpen}
          aria-label="Toggle menu"
        >
          ☰ Menu
        </button>

        <ul className={`items-center gap-6 text-sm font-semibold md:flex ${mobileOpen ? 'flex flex-col' : 'hidden'} md:flex`}>
          {items.map((item) => {
            const isActive = active === item;
            const base = 'relative cursor-pointer px-3 py-2 transition-all duration-150 text-blue-600 dark:text-blue-300';
            const activeClass = isActive ? 'text-orange-500' : 'hover:text-orange-500';

            return (
              <li key={item} className="group">
                <button
                  onClick={() => {
                    setActive(item);
                    if (mobileOpen) setMobileOpen(false);
                  }}
                  className={`${base} ${activeClass} ${isActive ? 'aria-current=page' : ''}`}
                >
                  {item}
                  <span className="inline-block ml-1 transition-opacity duration-150 opacity-0 group-hover:opacity-100">→</span>
                  <span
                    className={`absolute left-0 -bottom-1 h-[2px] bg-orange-500 transition-all duration-250 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`}
                  />
                </button>

                {item === 'News' && (
                  <ul className="absolute left-0 top-full z-10 hidden mt-2 w-40 rounded-lg border border-slate-200 bg-white py-2 shadow-lg group-hover:block dark:border-slate-700 dark:bg-slate-900">
                    {newsSubItems.map((sub) => (
                      <li key={sub}>
                        <a
                          href="#"
                          onClick={() => {
                            setActive('News');
                            if (mobileOpen) setMobileOpen(false);
                          }}
                          className="block px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-orange-50 hover:text-orange-500 dark:text-slate-200 dark:hover:bg-orange-900/20"
                        >
                          {sub}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Mobile submenu for News */}
      {mobileOpen && (
        <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 md:hidden">
          <ul className="mx-auto max-w-6xl px-4 py-2">
            {newsSubItems.map((sub) => (
              <li key={sub}>
                <button
                  onClick={() => {
                    setActive('News');
                    setMobileOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm font-medium text-slate-600 hover:text-orange-500 dark:text-slate-300"
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
