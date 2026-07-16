import { NavLink } from 'react-router-dom';
import { Home, Wallet, Send, Clock, CreditCard, ShieldAlert } from 'lucide-react';
import clsx from 'clsx';
import { useTheme } from '../hooks/useTheme';

const LINKS = [
  { to: '/dashboard', icon: Home, label: 'Inicio' },
  { to: '/dashboard/accounts', icon: Wallet, label: 'Cuentas' },
  { to: '/dashboard/transfers', icon: Send, label: 'Transferir' },
  { to: '/dashboard/history', icon: Clock, label: 'Movimientos' },
  { to: '/dashboard/cards', icon: CreditCard, label: 'Tarjetas' },
  { to: '/dashboard/limits', icon: ShieldAlert, label: 'Límites' },
];

export const Sidebar = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <aside className={clsx("w-64 min-h-screen p-6 border-r flex flex-col gap-8", isDark ? "border-white/10" : "border-black/5")}>
      <div className="font-extrabold text-2xl flex items-center gap-3">
        <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center", isDark ? "bg-white text-black" : "bg-redbanck-main text-white")}>R</div>
        RedBanck
      </div>
      <nav className="flex flex-col gap-2 flex-1">
        {LINKS.map(l => (
          <NavLink key={l.to} to={l.to} end={l.to === '/dashboard'} className={({isActive}) => clsx("flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all", isActive ? (isDark ? "bg-white/10 text-white" : "bg-redbanck-main/10 text-redbanck-main") : "opacity-70 hover:opacity-100 hover:bg-black/5")}>
            <l.icon size={20} /> {l.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};