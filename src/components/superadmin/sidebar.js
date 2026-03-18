import React from 'react';
import Logo from '../common/Logo';

export const navItems = [
  { key: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { key: 'tasks', label: 'Tasks', icon: 'task_alt' },
  { key: 'broadcasts', label: 'Broadcasts', icon: 'broadcast_on_home' },
  { key: 'programs', label: 'Programs', icon: 'calendar_month' },
  { key: 'news', label: 'News', icon: 'article' },
  { key: 'podcasts', label: 'Podcasts', icon: 'podcasts' },
  { key: 'program_videos', label: 'Program Videos', icon: 'videocam' },
  { key: 'services', label: 'Services', icon: 'design_services' },
  { key: 'assets', label: 'Assets', icon: 'inventory_2' },
  { key: 'media', label: 'Media Library', icon: 'perm_media' },
  { key: 'audit', label: 'Audit Logs', icon: 'history' },
  { key: 'staff', label: 'Staff Directory', icon: 'badge' },
  { key: 'donors', label: 'Donors', icon: 'volunteer_activism' },
  { key: 'partners', label: 'Partners', icon: 'handshake' },
  { key: 'volunteers', label: 'Volunteers', icon: 'group' },
  { key: 'social', label: 'Social Nexus', icon: 'share_reviews' },
  { key: 'analytics', label: 'Analytics', icon: 'analytics' },
  { key: 'users', label: 'User Management', icon: 'manage_accounts' },
];

const Sidebar = ({ user, active, onSelect, isOpen, onClose }) => {
  const permissions = user?.permissions || {};
  const isSuperuser = user?.role === 'superuser';

  const canAccess = (key) => {
    if (isSuperuser) return true;
    if (key === 'dashboard') return true;
    return permissions[key]?.read;
  };

  const filteredNavItems = navItems.filter(item => canAccess(item.key));

  return (
    <>
      <div 
        className={`fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      <aside className={`
        fixed inset-y-0 left-0 w-64 z-50 md:relative md:translate-x-0 transition-transform duration-300 transform bg-background-light dark:bg-background-dark border-r border-primary/10 flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo className="size-10" />
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Nyapui Admin</h2>
          </div>
          <button onClick={onClose} className="md:hidden p-2 text-slate-500 hover:text-primary">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
          <div className="pb-2">
            <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Main Menu</p>
            {filteredNavItems.slice(0, 5).map((item) => {
              const isActive = active === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => { onSelect(item.key); onClose?.(); }}
                  className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-primary text-white font-bold shadow-lg shadow-primary/20'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-primary/5 hover:text-primary'
                  }`}
                >
                  <span className={`material-symbols-outlined ${isActive ? 'scale-110' : 'group-hover:scale-110 transition-transform'}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-4 pb-2 border-t border-primary/5">
            <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Resources</p>
            {filteredNavItems.slice(5).map((item) => {
              const isActive = active === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => { onSelect(item.key); onClose?.(); }}
                  className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-primary text-white font-bold shadow-lg shadow-primary/20'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-primary/5 hover:text-primary'
                  }`}
                >
                  <span className={`material-symbols-outlined ${isActive ? 'scale-110' : 'group-hover:scale-110 transition-transform'}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-4 pb-2 border-t border-primary/5">
            <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">System</p>
            <button
              onClick={() => { onSelect('settings'); onClose?.(); }}
              className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                active === 'settings'
                  ? 'bg-primary text-white font-bold shadow-lg shadow-primary/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-primary/5 hover:text-primary'
              }`}
            >
              <span className={`material-symbols-outlined ${active === 'settings' ? 'scale-110' : 'group-hover:scale-110 transition-transform'}`}>
                settings
              </span>
              <span>Settings</span>
            </button>
          </div>
        </nav>

        <div className="p-4 border-t border-primary/10">
          <div className="flex items-center gap-3 px-3 py-2 bg-primary/5 rounded-2xl border border-primary/10">
            <div className="size-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20 overflow-hidden">
              {user?.profile_picture ? (
                <img src={user.profile_picture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined">person</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{user?.username || 'Admin User'}</p>
              <p className="text-[10px] text-primary font-black uppercase tracking-tighter">
                {user?.role || 'Station Manager'}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
