import { useCallback, useEffect, useState } from 'react';
import { useTheme } from '../hooks/useTheme';
import clsx from 'clsx';
import { Users, Activity, ShieldBan, Landmark, LogOut, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getMetrics, listUsers, blockUser, unblockUser } from '../features/admin/api';
import { logout as apiLogout } from '../features/auth/api';
import { getApiErrorMessage } from '../services/api';
import { useAuthStore } from '../store/authStore';
import type { AdminUserDto, MetricsDto, Page } from '../types/api';
import { formatMoney } from '../utils/format';

export default function Admin() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const currentUser = useAuthStore(s => s.user);

  const [metrics, setMetrics] = useState<MetricsDto | null>(null);
  const [usersPage, setUsersPage] = useState<Page<AdminUserDto> | null>(null);
  const [page, setPage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(() => {
    Promise.all([getMetrics(), listUsers(page, 15)])
      .then(([m, u]) => {
        setMetrics(m);
        setUsersPage(u);
      })
      .catch(err => setError(getApiErrorMessage(err)));
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const toggleBlock = async (user: AdminUserDto) => {
    setError(null);
    setBusyId(user.id);
    try {
      const updated = user.status === 'ACTIVE' ? await blockUser(user.id) : await unblockUser(user.id);
      setUsersPage(prev => prev
        ? { ...prev, content: prev.content.map(u => (u.id === updated.id ? updated : u)) }
        : prev);
      getMetrics().then(setMetrics).catch(() => {});
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const handleLogout = async () => {
    await apiLogout();
    navigate('/login');
  };

  const stats = metrics ? [
    { title: 'Usuarios Activos', value: metrics.activeUsers.toLocaleString(), icon: Users, color: 'text-blue-500' },
    { title: 'Transferencias (Hoy)', value: metrics.transfersToday.toLocaleString(), icon: Activity, color: 'text-green-500' },
    { title: 'Usuarios Bloqueados', value: metrics.blockedUsers.toLocaleString(), icon: ShieldBan, color: 'text-red-500' },
    { title: 'Saldo Total', value: formatMoney(metrics.totalBalance), icon: Landmark, color: 'text-purple-500' },
  ] : [];

  return (
    <div className="max-w-6xl mx-auto pb-10 px-6 pt-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-3xl font-bold">Panel Administrativo</h2>
          <p className="opacity-70 mt-1">Supervisión general del sistema y usuarios.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-semibold opacity-80">{currentUser?.firstName}</span>
          <button onClick={handleLogout} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20">
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 p-4 rounded-xl bg-red-500/10 text-red-500 text-sm font-semibold">
          <AlertCircle size={18} className="flex-shrink-0" /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.title} className={clsx("p-6 rounded-3xl shadow-sm flex items-center gap-4", isDark ? "bg-[#111111] border border-white/5" : "bg-white border border-black/5")}>
            <div className={clsx("w-14 h-14 rounded-2xl flex items-center justify-center bg-black/5 dark:bg-white/10 flex-shrink-0", stat.color)}>
              <stat.icon size={28} />
            </div>
            <div className="min-w-0">
              <p className="opacity-70 text-sm font-semibold">{stat.title}</p>
              <h3 className="text-2xl font-black truncate">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className={clsx("rounded-3xl shadow-sm overflow-hidden p-8", isDark ? "bg-[#111111] border border-white/5" : "bg-white border border-black/5")}>
        <h3 className="text-xl font-bold mb-6">Gestión de Usuarios</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={clsx("border-b", isDark ? "border-white/10 text-white/50" : "border-black/5 text-black/50")}>
                <th className="p-4 font-semibold text-sm">Documento</th>
                <th className="p-4 font-semibold text-sm">Nombre Completo</th>
                <th className="p-4 font-semibold text-sm">Email</th>
                <th className="p-4 font-semibold text-sm">Rol</th>
                <th className="p-4 font-semibold text-sm">Estado</th>
                <th className="p-4 font-semibold text-sm text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {(usersPage?.content ?? []).map((user) => (
                <tr key={user.id} className={clsx("border-b last:border-0 hover:bg-black/5 dark:hover:bg-white/5 transition-colors", isDark ? "border-white/5" : "border-black/5")}>
                  <td className="p-4 font-mono text-sm opacity-80">{user.documentId}</td>
                  <td className="p-4 font-bold">{user.firstName} {user.lastName}</td>
                  <td className="p-4 text-sm opacity-80">{user.email}</td>
                  <td className="p-4"><span className="px-2 py-1 bg-blue-500/10 text-blue-500 rounded text-xs font-bold">{user.role}</span></td>
                  <td className="p-4">
                    <span className={clsx("px-2 py-1 rounded text-xs font-bold", user.status === 'ACTIVE' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500")}>
                      {user.status === 'ACTIVE' ? 'Activo' : 'Bloqueado'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {user.role !== 'ADMIN' && (
                      <button
                        onClick={() => toggleBlock(user)}
                        disabled={busyId === user.id}
                        className={clsx("text-sm font-bold hover:underline disabled:opacity-50", user.status === 'ACTIVE' ? "text-redbanck-main" : "text-green-500")}
                      >
                        {busyId === user.id ? '...' : (user.status === 'ACTIVE' ? 'Bloquear' : 'Desbloquear')}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {usersPage && usersPage.totalPages > 1 && (
          <div className="flex items-center justify-between pt-4">
            <span className="text-sm opacity-60">
              Página {usersPage.number + 1} de {usersPage.totalPages} · {usersPage.totalElements} usuarios
            </span>
            <div className="flex gap-2">
              <button disabled={usersPage.first} onClick={() => setPage(p => p - 1)} className={clsx("p-2 rounded-lg transition-colors disabled:opacity-30", isDark ? "hover:bg-white/10" : "hover:bg-black/5")}>
                <ChevronLeft size={18} />
              </button>
              <button disabled={usersPage.last} onClick={() => setPage(p => p + 1)} className={clsx("p-2 rounded-lg transition-colors disabled:opacity-30", isDark ? "hover:bg-white/10" : "hover:bg-black/5")}>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
