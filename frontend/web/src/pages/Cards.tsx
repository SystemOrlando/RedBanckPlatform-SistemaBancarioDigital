import { useEffect, useState } from 'react';
import { useTheme } from '../hooks/useTheme';
import clsx from 'clsx';
import { Plus, Eye, EyeOff, Lock, Unlock, X, AlertCircle, CreditCard } from 'lucide-react';
import { listCards, createCard, blockCard, unblockCard, revealCard } from '../features/cards/api';
import { listAccounts } from '../features/accounts/api';
import { getApiErrorMessage } from '../services/api';
import { useAuthStore } from '../store/authStore';
import type { AccountDto, CardDto, RevealedCardDto } from '../types/api';

const groupPan = (pan: string) => pan.replace(/(.{4})/g, '$1 ').trim();

export default function Cards() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const user = useAuthStore(s => s.user);

  const [cards, setCards] = useState<CardDto[]>([]);
  const [accounts, setAccounts] = useState<AccountDto[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Datos revelados (solo en memoria, se ocultan al cambiar de tarjeta)
  const [revealed, setRevealed] = useState<RevealedCardDto | null>(null);
  const [askPassword, setAskPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [revealing, setRevealing] = useState(false);
  const [revealError, setRevealError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([listCards(), listAccounts()])
      .then(([cs, accs]) => {
        setCards(cs);
        setAccounts(accs);
        if (cs.length > 0) setSelectedId(cs[0].id);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const selected = cards.find(c => c.id === selectedId) ?? null;
  const isLocked = selected?.status === 'BLOCKED';

  const selectCard = (id: string) => {
    setSelectedId(id);
    setRevealed(null);
    setError(null);
  };

  const handleCreate = async () => {
    setError(null);
    const account = accounts[0];
    if (!account) {
      setError('Necesitas una cuenta activa para crear una tarjeta');
      return;
    }
    try {
      const card = await createCard(account.id);
      setCards(prev => [card, ...prev]);
      setSelectedId(card.id);
      setRevealed(null);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const handleToggleLock = async () => {
    if (!selected) return;
    setError(null);
    try {
      const updated = isLocked ? await unblockCard(selected.id) : await blockCard(selected.id);
      setCards(prev => prev.map(c => (c.id === updated.id ? updated : c)));
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const handleReveal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setRevealing(true);
    setRevealError(null);
    try {
      const data = await revealCard(selected.id, password);
      setRevealed(data);
      setAskPassword(false);
      setPassword('');
    } catch (err) {
      setRevealError(getApiErrorMessage(err));
    } finally {
      setRevealing(false);
    }
  };

  const holderName = user ? `${user.firstName} ${user.lastName}`.toUpperCase() : '';

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold">Mis Tarjetas</h2>
          <p className="opacity-70 mt-1">Gestiona tus tarjetas virtuales.</p>
        </div>
        <button onClick={handleCreate} className={clsx("px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold text-sm shadow-md transition-all", isDark ? "bg-white text-black hover:bg-gray-200" : "bg-black text-white hover:bg-gray-800")}>
          <Plus size={18} /> Nueva Tarjeta Virtual
        </button>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 p-4 rounded-xl bg-red-500/10 text-red-500 text-sm font-semibold">
          <AlertCircle size={18} className="flex-shrink-0" /> {error}
        </div>
      )}

      {loading && <p className="opacity-60">Cargando tarjetas...</p>}
      {!loading && cards.length === 0 && (
        <p className="opacity-60">Aún no tienes tarjetas. Crea tu primera tarjeta virtual.</p>
      )}

      {selected && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Card Visual */}
          <div className="flex flex-col gap-6">
            <div className={clsx(
              "w-full aspect-[1.586] rounded-[2rem] p-8 flex flex-col justify-between relative overflow-hidden shadow-2xl transition-all duration-500",
              isLocked ? "bg-gray-800 grayscale" : "bg-gradient-to-br from-[#111] via-[#222] to-[#0a0a0a]"
            )}>
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-white/0 via-white/5 to-white/20 pointer-events-none" />

              <div className="flex justify-between items-start z-10 text-white">
                <span className="text-2xl font-black tracking-tighter">RedBanck</span>
                <span className="font-semibold opacity-80 border border-white/20 px-3 py-1 rounded-full text-xs">
                  {isLocked ? 'BLOQUEADA' : 'VIRTUAL'}
                </span>
              </div>

              <div className="z-10 text-white mt-auto">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-8 rounded bg-gradient-to-r from-yellow-200 to-yellow-500 opacity-90 shadow-sm" />
                  <div className="flex gap-1">
                    <div className="w-6 h-6 rounded-full bg-red-500/80" />
                    <div className="w-6 h-6 rounded-full bg-yellow-500/80 -ml-3 mix-blend-screen" />
                  </div>
                </div>
                <p className="font-mono text-2xl tracking-[0.2em] mb-2 drop-shadow-md">
                  {revealed ? groupPan(revealed.cardNumber) : selected.maskedNumber.replace(/\*/g, '•')}
                </p>
                <div className="flex justify-between items-end font-mono text-sm opacity-80">
                  <div className="flex flex-col">
                    <span className="text-[10px] opacity-70">TITULAR</span>
                    <span>{holderName}</span>
                  </div>
                  <div className="flex gap-6">
                    <div className="flex flex-col">
                      <span className="text-[10px] opacity-70">VENCE</span>
                      <span>{selected.expiration}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] opacity-70">CVV</span>
                      <span>{revealed ? revealed.cvv : '•••'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => (revealed ? setRevealed(null) : setAskPassword(true))}
                className={clsx("flex-1 py-4 rounded-2xl flex flex-col items-center gap-2 font-bold transition-all shadow-sm", isDark ? "bg-[#111111] hover:bg-[#222222]" : "bg-white border border-black/5 hover:bg-black/5")}
              >
                {revealed ? <EyeOff size={24} className="text-redbanck-main" /> : <Eye size={24} className="text-redbanck-main" />}
                {revealed ? "Ocultar Datos" : "Ver Datos"}
              </button>
              <button onClick={handleToggleLock} className={clsx("flex-1 py-4 rounded-2xl flex flex-col items-center gap-2 font-bold transition-all shadow-sm", isDark ? "bg-[#111111] hover:bg-[#222222]" : "bg-white border border-black/5 hover:bg-black/5")}>
                {isLocked ? <Unlock size={24} className="text-green-500" /> : <Lock size={24} className="text-red-500" />}
                {isLocked ? "Desbloquear" : "Congelar"}
              </button>
            </div>
          </div>

          {/* Card list */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xl font-bold mb-2">Todas mis tarjetas</h3>
            {cards.map(card => {
              const account = accounts.find(a => a.id === card.accountId);
              return (
                <button
                  key={card.id}
                  onClick={() => selectCard(card.id)}
                  className={clsx(
                    "p-5 rounded-2xl flex items-center justify-between shadow-sm text-left transition-all",
                    card.id === selectedId
                      ? "ring-2 ring-redbanck-main"
                      : "opacity-80 hover:opacity-100",
                    isDark ? "bg-[#111111]" : "bg-white border border-black/5"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center">
                      <CreditCard size={20} />
                    </div>
                    <div>
                      <p className="font-bold font-mono">{card.maskedNumber}</p>
                      <p className="text-sm opacity-70">{account?.alias ?? 'Cuenta'} · Vence {card.expiration}</p>
                    </div>
                  </div>
                  <span className={clsx("px-2 py-1 rounded text-xs font-bold", card.status === 'ACTIVE' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500")}>
                    {card.status === 'ACTIVE' ? 'ACTIVA' : 'BLOQUEADA'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal confirmar contraseña */}
      {askPassword && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className={clsx("w-full max-w-sm p-8 rounded-3xl shadow-2xl", isDark ? "bg-[#111111] border border-white/10" : "bg-white")}>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-bold">Confirma tu identidad</h3>
              <button onClick={() => { setAskPassword(false); setRevealError(null); setPassword(''); }} className="opacity-60 hover:opacity-100"><X size={22} /></button>
            </div>
            <p className="opacity-70 text-sm mb-6">Ingresa tu contraseña para ver los datos completos de la tarjeta.</p>
            <form onSubmit={handleReveal} className="flex flex-col gap-4">
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoFocus
                placeholder="Contraseña"
                className={clsx("w-full h-12 px-4 rounded-xl font-medium outline-none", isDark ? "bg-black/20 text-white" : "bg-black/5 text-black")}
              />
              {revealError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 text-red-500 text-sm font-semibold">
                  <AlertCircle size={16} className="flex-shrink-0" /> {revealError}
                </div>
              )}
              <button type="submit" disabled={revealing} className="w-full h-12 bg-redbanck-main text-white rounded-xl font-bold hover:bg-red-700 transition-colors disabled:opacity-60">
                {revealing ? 'Verificando...' : 'Ver Datos'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
