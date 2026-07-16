import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '../hooks/useTheme';
import clsx from 'clsx';
import { ArrowUpRight, ArrowDownRight, Wallet, CreditCard, Send, Plus } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Link } from 'react-router-dom';
import { listAccounts } from '../features/accounts/api';
import { searchTransactions } from '../features/history/api';
import type { AccountDto, TransactionDto } from '../types/api';
import { formatMoney, formatDateTime } from '../utils/format';

const DAY_MS = 86_400_000;
const DAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];

export default function Dashboard() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [accounts, setAccounts] = useState<AccountDto[]>([]);
  const [transactions, setTransactions] = useState<TransactionDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([listAccounts(), searchTransactions({ size: 100 })])
      .then(([accs, txPage]) => {
        setAccounts(accs);
        setTransactions(txPage.content);
      })
      .catch(() => { /* el interceptor gestiona la sesión; se muestra el estado vacío */ })
      .finally(() => setLoading(false));
  }, []);

  const totalBalance = useMemo(
    () => accounts.reduce((sum, a) => sum + a.balance, 0),
    [accounts]
  );

  const mainAccount = accounts[0];

  // Ingresos y gastos del mes en curso (sobre los movimientos cargados)
  const { monthIn, monthOut } = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    let monthIn = 0;
    let monthOut = 0;
    for (const tx of transactions) {
      if (new Date(tx.createdAt).getTime() < start) continue;
      if (tx.type === 'TRANSFER_OUT') monthOut += tx.amount;
      else monthIn += tx.amount;
    }
    return { monthIn, monthOut };
  }, [transactions]);

  // Evolución del saldo total en los últimos 7 días: se parte del saldo
  // actual y se deshacen los flujos netos de cada día hacia atrás.
  const chartData = useMemo(() => {
    const days: { name: string; balance: number }[] = [];
    let balance = totalBalance;
    for (let i = 0; i < 7; i++) {
      const dayStart = new Date(new Date().setHours(0, 0, 0, 0)).getTime() - i * DAY_MS;
      days.unshift({ name: DAY_LABELS[new Date(dayStart).getDay()], balance });
      const dayNet = transactions
        .filter(tx => {
          const t = new Date(tx.createdAt).getTime();
          return t >= dayStart && t < dayStart + DAY_MS;
        })
        .reduce((net, tx) => net + (tx.type === 'TRANSFER_OUT' ? -tx.amount : tx.amount), 0);
      balance -= dayNet;
    }
    return days;
  }, [transactions, totalBalance]);

  const recent = transactions.slice(0, 4);

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto pb-10">

      {/* Header Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={clsx("p-6 rounded-3xl shadow-sm flex flex-col justify-between h-48", isDark ? "bg-gradient-to-br from-red-600 to-redbanck-main text-white" : "bg-gradient-to-br from-red-500 to-red-700 text-white")}>
          <div>
            <p className="opacity-80 font-medium">Saldo Total Disponible</p>
            <h2 className="text-4xl font-bold mt-2">{loading ? '...' : formatMoney(totalBalance)}</h2>
          </div>
          <div className="flex justify-between items-center opacity-80 text-sm">
            <span>{mainAccount?.alias ?? 'Sin cuentas'}</span>
            <span className="font-mono">{mainAccount?.maskedNumber ?? ''}</span>
          </div>
        </div>

        <div className={clsx("p-6 rounded-3xl shadow-sm flex flex-col justify-between h-48", isDark ? "bg-[#111111] border border-white/5" : "bg-white border border-black/5")}>
          <div>
            <div className="flex items-center gap-2 text-green-500 font-bold mb-2">
              <ArrowUpRight size={20} /> Ingresos del mes
            </div>
            <h2 className="text-3xl font-bold">{loading ? '...' : formatMoney(monthIn)}</h2>
          </div>
          <p className="opacity-60 text-sm font-medium">Depósitos y transferencias recibidas</p>
        </div>

        <div className={clsx("p-6 rounded-3xl shadow-sm flex flex-col justify-between h-48", isDark ? "bg-[#111111] border border-white/5" : "bg-white border border-black/5")}>
          <div>
            <div className="flex items-center gap-2 text-red-500 font-bold mb-2">
              <ArrowDownRight size={20} /> Gastos del mes
            </div>
            <h2 className="text-3xl font-bold">{loading ? '...' : formatMoney(monthOut)}</h2>
          </div>
          <p className="opacity-60 text-sm font-medium">Transferencias enviadas</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-xl font-bold mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/dashboard/transfers" className={clsx("p-4 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all", isDark ? "bg-[#1A1A1A] hover:bg-[#222222]" : "bg-black/5 hover:bg-black/10")}>
            <div className="w-12 h-12 rounded-full bg-redbanck-main/20 text-redbanck-main flex items-center justify-center"><Send size={24} /></div>
            <span className="font-bold text-sm">Transferir</span>
          </Link>
          <Link to="/dashboard/history" className={clsx("p-4 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all", isDark ? "bg-[#1A1A1A] hover:bg-[#222222]" : "bg-black/5 hover:bg-black/10")}>
            <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center"><Wallet size={24} /></div>
            <span className="font-bold text-sm">Movimientos</span>
          </Link>
          <Link to="/dashboard/cards" className={clsx("p-4 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all", isDark ? "bg-[#1A1A1A] hover:bg-[#222222]" : "bg-black/5 hover:bg-black/10")}>
            <div className="w-12 h-12 rounded-full bg-purple-500/20 text-purple-500 flex items-center justify-center"><CreditCard size={24} /></div>
            <span className="font-bold text-sm">Tarjetas</span>
          </Link>
          <Link to="/dashboard/accounts" className={clsx("p-4 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all", isDark ? "bg-[#1A1A1A] hover:bg-[#222222]" : "bg-black/5 hover:bg-black/10")}>
            <div className="w-12 h-12 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center"><Plus size={24} /></div>
            <span className="font-bold text-sm">Nueva Cuenta</span>
          </Link>
        </div>
      </div>

      {/* Chart & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Chart */}
        <div className={clsx("lg:col-span-2 p-6 rounded-3xl shadow-sm", isDark ? "bg-[#111111] border border-white/5" : "bg-white border border-black/5")}>
          <h3 className="text-xl font-bold mb-6">Evolución del Saldo</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#DC2626" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#DC2626" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke={isDark ? "#666" : "#aaa"} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke={isDark ? "#666" : "#aaa"} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `S/ ${val}`} />
                <Tooltip
                  formatter={(value) => [formatMoney(Number(value)), 'Saldo']}
                  contentStyle={{ backgroundColor: isDark ? '#222' : '#fff', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                />
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#333" : "#eee"} vertical={false} />
                <Area type="monotone" dataKey="balance" stroke="#DC2626" strokeWidth={3} fillOpacity={1} fill="url(#colorBalance)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className={clsx("p-6 rounded-3xl shadow-sm", isDark ? "bg-[#111111] border border-white/5" : "bg-white border border-black/5")}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">Recientes</h3>
            <Link to="/dashboard/history" className="text-sm text-redbanck-main font-bold hover:underline">Ver todo</Link>
          </div>
          <div className="flex flex-col gap-4">
            {recent.length === 0 && !loading && (
              <p className="opacity-60 text-sm">Aún no tienes movimientos.</p>
            )}
            {recent.map((tx) => {
              const isOut = tx.type === 'TRANSFER_OUT';
              const title = tx.counterpartyName ?? tx.description ?? 'Movimiento';
              return (
                <div key={tx.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={clsx("w-10 h-10 rounded-full flex items-center justify-center", isOut ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500")}>
                      {isOut ? <ArrowDownRight size={18} /> : <ArrowUpRight size={18} />}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{title}</p>
                      <p className="text-xs opacity-60">{formatDateTime(tx.createdAt)}</p>
                    </div>
                  </div>
                  <span className={clsx("font-bold text-sm", isOut ? "" : "text-green-500")}>
                    {isOut ? '-' : '+'}{formatMoney(tx.amount)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
