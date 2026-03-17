import './App.css';
import { useEffect, useState, useCallback } from 'react';
import Dashboard from './components/superadmin/dashboard';
import Login from './components/superadmin/login';
import Loading from './components/superadmin/loading';
import Modal from './components/common/Modal';
import Logo from './components/common/Logo';
import API_URL from './config';

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [modal, setModal] = useState({ 
    open: false, 
    type: 'info', 
    title: '', 
    message: '',
    children: null,
    actionText: 'Okay',
    onAction: null,
    secondaryText: null,
    icon: null
  });

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      
      // Delay prompt for maximum engagement
      setTimeout(() => {
        setModal({
          open: true,
          type: 'install',
          title: 'Nyapui Radio App',
          icon: <Logo className="size-16" />,
          children: (
            <div className="space-y-3">
              <p className="text-sm">Install our official desktop platform for a faster, more reliable institutional experience.</p>
              <div className="flex justify-center gap-3 pt-2">
                <div className="flex flex-col items-center gap-1">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <span className="material-symbols-outlined text-sm">bolt</span>
                  </div>
                  <span className="text-[8px] font-black uppercase tracking-tighter">Fast access</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <span className="material-symbols-outlined text-sm">wifi_off</span>
                  </div>
                  <span className="text-[8px] font-black uppercase tracking-tighter">Offline mode</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <span className="material-symbols-outlined text-sm">notifications</span>
                  </div>
                  <span className="text-[8px] font-black uppercase tracking-tighter">Live Updates</span>
                </div>
              </div>
            </div>
          ),
          actionText: 'Install App Now',
          onAction: async () => {
            if (e) {
              e.prompt();
              const { outcome } = await e.userChoice;
              console.log(`User response to the install prompt: ${outcome}`);
            }
            setModal(prev => ({ ...prev, open: false }));
          },
          secondaryText: 'Maybe Later'
        });
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('authToken');
    setUser(null);
    setModal({
      open: true,
      type: 'info',
      title: 'Session Ended',
      message: 'You have been logged out safely.',
      onAction: () => setModal(prev => ({ ...prev, open: false }))
    });
  }, []);

  const confirmLogout = () => {
    setModal({
      open: true,
      type: 'danger',
      title: 'Confirm Logout',
      message: 'Are you sure you want to end your session? You will need to login again to access the dashboard.',
      actionText: 'Logout Now',
      onAction: () => {
        handleLogout();
        setModal(prev => ({ ...prev, open: false }));
      },
      secondaryText: 'Stay Logged In',
      onSecondary: () => setModal(prev => ({ ...prev, open: false }))
    });
  };

  // Inactivity Logic
  useEffect(() => {
    if (!user) return;

    let timeout;
    const INACTIVITY_TIME = 60000; // 1 minute

    const resetTimer = () => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        handleLogout();
        setModal({
          open: true,
          type: 'error',
          title: 'Session Timeout',
          message: 'You were logged out due to 1 minute of inactivity.',
          actionText: 'Login Again',
          onAction: () => setModal(prev => ({ ...prev, open: false }))
        });
      }, INACTIVITY_TIME);
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => document.addEventListener(event, resetTimer));
    
    resetTimer(); // Start timer initially

    return () => {
      if (timeout) clearTimeout(timeout);
      events.forEach(event => document.removeEventListener(event, resetTimer));
    };
  }, [user, handleLogout]);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const response = await fetch(`${API_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response.ok) {
            const data = await response.json();
            setUser({ ...data.user, token });
          } else {
            localStorage.removeItem('authToken');
          }
        } catch (err) {
          console.error('Auth verification failed', err);
        }
      }
      
      // Delay to show motion graphics
      setTimeout(() => {
        setIsLoading(false);
      }, 2500);
    };

    checkAuth();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  if (isLoading) return <Loading />;

  return (
    <>
      <Modal 
        {...modal} 
        onClose={() => setModal(prev => ({ ...prev, open: false }))} 
      />
      {user ? (
        <Dashboard user={user} onLogout={confirmLogout} onUpdateProfile={(userData) => setUser(userData)} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </>
  );
}

export default App;
