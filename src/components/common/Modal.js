import React from 'react';

const styleMap = {
  success: {
    icon: 'check_circle',
    title: 'Success!',
    color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    button: 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20',
  },
  error: {
    icon: 'error',
    title: 'Oops!',
    color: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
    button: 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20',
  },
  welcome: {
    icon: 'waving_hand',
    title: 'Welcome Back!',
    color: 'text-primary bg-primary/10 border-primary/20',
    button: 'bg-primary hover:bg-primary/90 shadow-primary/20',
  },
  info: {
    icon: 'info',
    title: 'Notice',
    color: 'text-sky-500 bg-sky-500/10 border-sky-500/20',
    button: 'bg-sky-500 hover:bg-sky-600 shadow-sky-500/20',
  },
  danger: {
    icon: 'warning',
    title: 'Are you sure?',
    color: 'text-rose-600 bg-rose-500/10 border-rose-500/20',
    button: 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20',
  },
  install: {
    icon: 'get_app',
    title: 'Get the App',
    color: 'text-primary bg-primary/5 border-primary/20',
    button: 'bg-primary hover:bg-primary/90 shadow-primary/20',
  }
};

const Modal = ({ 
  type = 'info', 
  title, 
  message, 
  children,
  open, 
  onClose, 
  actionText = 'Okay', 
  onAction,
  secondaryText,
  onSecondary,
  icon
}) => {
  if (!open) return null;

  const config = styleMap[type] || styleMap.info;
  const displayTitle = title || config.title;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-sm transform overflow-hidden rounded-[2.5rem] bg-white dark:bg-slate-900 shadow-2xl transition-all border border-slate-200 dark:border-slate-800 p-8">
        <div className="flex flex-col items-center text-center">
          <div className={`mb-6 flex h-24 w-24 items-center justify-center rounded-3xl border-2 ${config.color} rotate-3 hover:rotate-0 transition-transform duration-300`}>
            {icon ? icon : (
              <span className="material-symbols-outlined text-5xl">{config.icon}</span>
            )}
          </div>
          
          <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
            {displayTitle}
          </h3>
          
          <div className="text-slate-600 dark:text-slate-400 text-base leading-relaxed mb-8">
            {children || message}
          </div>
          
          <div className="w-full flex flex-col gap-3">
            <button
              type="button"
              className={`w-full inline-flex justify-center items-center gap-2 rounded-2xl px-6 py-4 text-base font-bold text-white shadow-xl transition-all active:scale-[0.98] ${config.button}`}
              onClick={onAction || onClose}
            >
              {actionText}
              <span className="material-symbols-outlined text-xl">
                {onAction ? 'check_circle' : 'arrow_right_alt'}
              </span>
            </button>

            {secondaryText && (
              <button
                type="button"
                className="w-full inline-flex justify-center items-center rounded-2xl px-6 py-3 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                onClick={onSecondary || onClose}
              >
                {secondaryText}
              </button>
            )}
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className={`absolute -top-10 -right-10 h-32 w-32 rounded-full opacity-5 ${config.color.split(' ')[0].replace('text-', 'bg-')}`} />
        <div className={`absolute -bottom-10 -left-10 h-32 w-32 rounded-full opacity-5 ${config.color.split(' ')[0].replace('text-', 'bg-')}`} />
      </div>
    </div>
  );
};

export default Modal;
