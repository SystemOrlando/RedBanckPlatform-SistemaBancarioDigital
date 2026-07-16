import { useEffect, useState } from 'react';
import { useTheme } from '../hooks/useTheme';
import clsx from 'clsx';
import { Wallet, Plus, Copy, Check, X, AlertCircle } from 'lucide-react';
import { listAccounts, openAccount } from '../features/accounts/api';
import { getApiErrorMessage } from '../services/api';
import type { AccountDto, AccountType } from '../types/api';
import { formatMoney } from '../utils/format';

const TYPE_LABEL: Record<AccountType, string> = {
  SAVINGS: 'Cuenta Ahorro',
  CHECKING: 'Cuenta Corriente',
};

const CARD_COLORS = ['bg-redbanck-main', 'bg-green-600', 'bg-blue-600', 'bg-purple-600', 'bg-amber-600'];

export default function Accounts() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [accounts, setAccounts] = useState<AccountDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal de apertura
  const [showModal, setShowModal] = useState(false);
  const [alias, setAlias] = useState('');
  const [type, setType] = useState<AccountType>('SAVINGS');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listAccounts()
      .then(setAccounts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const copyNumber = async (account: AccountDto) => {
    await navigator.clipboard.writeText(account.accountNumber);
    setCopiedId(account.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleOpen = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const created = await openAccount(alias.trim(), type);
      setAccounts(prev => [...prev, created]);
      setShowModal(false);
      setAlias('');
      setType('SAVINGS');
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold">Mis Cuentas</h2>
          <p className="opacity-70 mt-1">Gestiona tus cuentas de ahorro y corriente.</p>
        </div>
        <button onClick={() => setShowModal(true)} className={clsx("px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold text-sm shadow-md transition-all", isDark ? "bg-white text-black hover:bg-gray-200" : "bg-redbanck-main text-white hover:bg-red-700")}>
          <Plus size={18} /> Abrir Nueva Cuenta
        </button>
      </div>

      {loading && <p className="opacity-60">Cargando cuentas...</p>}
      {!loading && accounts.length === 0 && <p className="opacity-60">No tienes cuentas todavía.</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {accounts.map((acc, i) => (
          <div key={acc.id} className={clsx("p-8 rounded-[2rem] flex flex-col justify-between h-56 relative overflow-hidden shadow-sm transition-all hover:-translate-y-1", isDark ? "bg-[#111111] border border-white/5" : "bg-white border border-black/5")}>
            <div className={clsx("absolute top-0 right-0 w-32 h-32 blur-3xl opacity-20 rounded-full -mr-10 -mt-10", CARD_COLORS[i % CARD_COLORS.length])} />

            <div className="flex justify-between items-start z-10">
              <div>
                <h3 className="text-xl font-bold">{acc.alias}</h3>
                <p className="opacity-60 text-sm font-medium">{TYPE_LABEL[acc.type]}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center">
                <Wallet size={20} />
              </div>
            </div>

            <div className="z-10">
              <p className="opacity-60 text-sm mb-1 flex items-center gap-2">
                Número de cuenta
                <button onClick={() => copyNumber(acc)} className="hover:text-redbanck-main transition-colors">
                  {copiedId === acc.id ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                </button>
              </p>
              <p className="font-mono font-medium mb-4">{acc.accountNumber}</p>
              <div className="flex justify-between items-end">
                <h2 className="text-3xl font-black">{formatMoney(acc.balance, acc.currency)}</h2>
                <span className={clsx("text-xs font-bold px-2 py-1 rounded-md", acc.status === 'ACTIVE' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500")}>
                  {acc.status === 'ACTIVE' ? 'ACTIVA' : 'CERRADA'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Abrir Cuenta */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className={clsx("w-full max-w-md p-8 rounded-3xl shadow-2xl", isDark ? "bg-[#111111] border border-white/10" : "bg-white")}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">Abrir Nueva Cuenta</h3>
              <button onClick={() => setShowModal(false)} className="opacity-60 hover:opacity-100"><X size={24} /></button>
            </div>
            <form onSubmit={handleOpen} className="flex flex-col gap-5">
              <div>
                <label className="block text-sm font-semibold mb-2">Alias de la cuenta</label>
                <input
                  value={alias}
                  onChange={e => setAlias(e.target.value)}
                  required
                  minLength={3}
                  maxLength={60}
                  placeholder="Ej. Ahorros Viaje"
                  className={clsx("w-full h-12 px-4 rounded-xl font-medium outline-none", isDark ? "bg-black/20 text-white" : "bg-black/5 text-black")}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Tipo de cuenta</label>
                <div className="grid grid-cols-2 gap-3">
                  {(['SAVINGS', 'CHECKING'] as AccountType[]).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={clsx("h-12 rounded-xl font-bold text-sm transition-all", type === t ? "bg-redbanck-main text-white" : (isDark ? "bg-black/20 opacity-70" : "bg-black/5 opacity-70"))}
                    >
                      {TYPE_LABEL[t]}
                    </button>
                  ))}
                </div>
              </div>
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 text-red-500 text-sm font-semibold">
                  <AlertCircle size={16} className="flex-shrink-0" /> {error}
                </div>
              )}
              <button type="submit" disabled={saving} className="w-full h-12 bg-redbanck-main text-white rounded-xl font-bold hover:bg-red-700 transition-colors disabled:opacity-60">
                {saving ? 'Abriendo...' : 'Abrir Cuenta'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
