import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAuthStore } from '../store/authStore';
import { logout as apiLogout } from '../features/auth/api';
import { LogOut } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import clsx from 'clsx';

export default function DashboardLayout() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const handleLogout = async () => {
    await apiLogout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className={clsx("h-20 border-b flex items-center justify-between px-8", isDark ? "border-white/10" : "border-black/5")}>
          <h1 className="text-xl font-bold">Mi Banca</h1>
          <div className="flex items-center gap-4">
            <button onClick={toggleTheme} className="opacity-70 hover:opacity-100">{isDark ? '☀️ Modo Día' : '🌙 Modo Noche'}</button>
            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-current/10">
              <span className="font-semibold">{user?.firstName || 'Usuario'}</span>
              <button onClick={handleLogout} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20">
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}