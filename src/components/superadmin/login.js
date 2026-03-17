import React, { useState } from 'react';
import Modal from '../common/Modal';
import Loading from './loading';
import Logo from '../common/Logo';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [modal, setModal] = useState({ 
    open: false, 
    type: 'info', 
    title: '', 
    message: '', 
    actionText: 'Okay',
    onClose: () => {} 
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setModal({
        open: true,
        type: 'error',
        title: 'Missing Info',
        message: 'Please enter both username and password to continue.',
        actionText: 'Okay',
        onClose: () => setModal(prev => ({ ...prev, open: false }))
      });
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const json = await response.json().catch(() => ({}));
        setModal({
          open: true,
          type: 'error',
          title: 'Login Failed',
          message: json.error || 'Invalid credentials. Please check your username and password.',
          actionText: 'Try Again',
          onClose: () => setModal(prev => ({ ...prev, open: false }))
        });
        return;
      }

      const data = await response.json();
      localStorage.setItem('authToken', data.token);
      
      setModal({
        open: true,
        type: 'welcome',
        title: 'Access Granted!',
        message: `Welcome back, ${data.user.username || 'Administrator'}. Your session has been successfully authenticated.`,
        actionText: 'Enter Dashboard',
        onClose: () => onLogin(data.user)
      });

    } catch (err) {
      console.error('Login failed', err);
      setModal({
        open: true,
        type: 'error',
        title: 'Connection Error',
        message: 'We couldn\'t reach the server. Please check your internet connection and try again.',
        actionText: 'Okay',
        onClose: () => setModal(prev => ({ ...prev, open: false }))
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="font-display bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex flex-col">
      {submitting && <Loading message="Authenticating Credentials..." />}
      
      <Modal 
        {...modal}
        onClose={() => {
          modal.onClose();
          setModal(prev => ({ ...prev, open: false }));
        }}
      />
      
      <div className="fixed inset-0 z-0 opacity-10 pointer-events-none bg-center bg-cover" style={{
        backgroundImage:
          'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAAArQjpmDF7W0boPkvWwOcrOXvgtQY36hu1gCMxjNdYo8G7yO8AsMTPM3g-nhX_OeiKRaOGBWM_ZuQ3WahPGkTNO9EloWHpc_xNtY1xC88HZZYDBRfJoUpMYMvxcyZJluZw8HVDY3YqcVZrfSUN6dTkeao9pkAHEVht89CaO_OYWP_ENRAtGSwAJWuAeD6H0dsJ_mTJ8X9qC9D3b1hRAj9lUJa1yt4JdNaUKOUr0Kg7Risz5VcP3JTVsloB0tQvs1QfRzekSrvKXQ")',
      }} />

      <header className="relative z-10 flex items-center justify-between border-b border-slate-200 dark:border-primary/20 px-6 py-4 lg:px-10">
        <div className="flex items-center gap-3">
          <Logo className="size-10" />
          <h2 className="text-xl font-bold tracking-tight">Nyapui Radio</h2>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-sm font-medium hover:text-primary transition-colors">Help Center</button>
          <div className="h-4 w-[1px] bg-slate-300 dark:bg-slate-700" />
          <span className="text-xs text-slate-500 dark:text-slate-400">v2.4.0</span>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-primary/20 rounded-xl shadow-2xl p-8 lg:p-10">
            <div className="text-center mb-10">
              <Logo className="size-20 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Admin Access</h1>
              <p className="mt-2 text-slate-600 dark:text-slate-400">Secure gateway for Nyapui Radio dashboard</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1" htmlFor="username">
                  Email or Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <span className="material-symbols-outlined text-xl">person</span>
                  </div>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin@nyapuiradio.com"
                    className="block w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none placeholder:text-slate-400 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="password">
                    Password
                  </label>
                  <button type="button" className="text-xs font-medium text-primary hover:underline">Forgot password?</button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <span className="material-symbols-outlined text-xl">lock</span>
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-11 pr-12 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none placeholder:text-slate-400 text-slate-900 dark:text-white"
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 text-sm hover:text-primary cursor-pointer transition-colors"
                       onClick={() => {
                         const input = document.getElementById('password');
                         input.type = input.type === 'password' ? 'text' : 'password';
                       }}>
                    <span className="material-symbols-outlined text-xl">visibility</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary bg-transparent" />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600 dark:text-slate-400">
                  Keep me logged in
                </label>
              </div>

              <button
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-transform active:scale-[0.98] disabled:opacity-60"
                type="submit"
                disabled={submitting}
              >
                <span>{submitting ? 'Signing in...' : 'Login to Dashboard'}</span>
                <span className="material-symbols-outlined text-xl">login</span>
              </button>
            </form>

            <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-800 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-500 uppercase tracking-widest font-semibold mb-4">Empowering Women's Voices</p>
              <div className="flex justify-center gap-6 grayscale opacity-50">
                <span className="material-symbols-outlined">female</span>
                <span className="material-symbols-outlined">podcasts</span>
                <span className="material-symbols-outlined">language</span>
              </div>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
            Unauthorized access is strictly prohibited.
            <br />
            © 2024 Nyapui Radio. All Rights Reserved.
          </p>
        </div>
      </main>

      <div className="fixed bottom-0 right-0 -z-10 translate-x-1/4 translate-y-1/4">
        <div className="w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
      </div>
      <div className="fixed top-0 left-0 -z-10 -translate-x-1/4 -translate-y-1/4">
        <div className="w-96 h-96 bg-primary/5 rounded-full blur-[100px]" />
      </div>
    </div>
  );
};

export default Login;

