import React, { useEffect, useState } from 'react';
import { useTheme } from '../hooks/useTheme';
import clsx from 'clsx';
import { Send, ArrowRight, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { listAccounts } from '../features/accounts/api';
import { createTransfer } from '../features/transfers/api';
import { getApiErrorMessage } from '../services/api';
import type { AccountDto, TransferReceipt } from '../types/api';
import { formatMoney } from '../utils/format';

export default function Transfers() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [accounts, setAccounts] = useState<AccountDto[]>([]);
  const [step, setStep] = useState(1);
  const [sourceId, setSourceId] = useState('');
  const [destination, setDestination] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<TransferReceipt | null>(null);

  useEffect(() => {
    listAccounts()
      .then(accs => {
        setAccounts(accs);
        if (accs.length > 0) setSourceId(accs[0].id);
      })
      .catch(() => {});
  }, []);

  const sourceAccount = accounts.find(a => a.id === sourceId);

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (step === 1) {
      if (!/^\d{14}$/.test(destination)) {
        setError('La cuenta de destino debe tener 14 dígitos');
        return;
      }
      setStep(2);
      return;
    }

    // Paso 2: ejecutar la transferencia
    setSending(true);
    try {
      const result = await createTransfer({
        sourceAccountId: sourceId,
        destinationAccountNumber: destination,
        amount: Number(amount),
        description: description || undefined,
      });
      setReceipt(result);
      setStep(3);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  const reset = () => {
    setStep(1);
    setAmount('');
    setDestination('');
    setDescription('');
    setReceipt(null);
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="mb-8">
        <h2 className="text-3xl font-bold">Transferencias</h2>
        <p className="opacity-70 mt-1">Envía dinero de forma rápida y segura.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className={clsx("lg:col-span-2 p-8 rounded-3xl shadow-sm", isDark ? "bg-[#111111] border border-white/5" : "bg-white border border-black/5")}>

          {/* Progress Indicator */}
          <div className="flex items-center gap-4 mb-8">
            {[1, 2, 3].map((num) => (
              <React.Fragment key={num}>
                <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors", step >= num ? "bg-redbanck-main text-white" : (isDark ? "bg-[#222222] text-white/50" : "bg-black/5 text-black/50"))}>
                  {num}
                </div>
                {num < 3 && <div className={clsx("h-1 flex-1 rounded-full", step > num ? "bg-redbanck-main" : (isDark ? "bg-[#222222]" : "bg-black/5"))} />}
              </React.Fragment>
            ))}
          </div>

          <form onSubmit={handleNext}>
            <AnimateStep step={step} current={1}>
              <h3 className="text-xl font-bold mb-6">Datos de la Transferencia</h3>
              <div className="flex flex-col gap-5">
                <div>
                  <label className="block text-sm font-semibold mb-2">Cuenta de Origen</label>
                  <select
                    value={sourceId}
                    onChange={e => setSourceId(e.target.value)}
                    required
                    className={clsx("w-full h-14 px-4 rounded-xl font-medium outline-none", isDark ? "bg-black/20 text-white border border-white/10" : "bg-black/5 text-black border border-black/5")}
                  >
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {acc.alias} · {acc.maskedNumber} · {formatMoney(acc.balance)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Cuenta Destino (14 dígitos)</label>
                  <input
                    type="text"
                    value={destination}
                    onChange={e => setDestination(e.target.value.replace(/\D/g, '').slice(0, 14))}
                    placeholder="Ej. 12345678901234"
                    required
                    className={clsx("w-full h-14 px-4 rounded-xl font-mono", isDark ? "bg-black/20 text-white border border-white/10" : "bg-black/5 text-black border border-black/5")}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Descripción (Opcional)</label>
                  <input
                    type="text"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    maxLength={140}
                    placeholder="Ej. Pago alquiler"
                    className={clsx("w-full h-14 px-4 rounded-xl", isDark ? "bg-black/20 text-white border border-white/10" : "bg-black/5 text-black border border-black/5")}
                  />
                </div>
              </div>
            </AnimateStep>

            <AnimateStep step={step} current={2}>
              <h3 className="text-xl font-bold mb-6">Monto a Transferir</h3>
              <div className="flex flex-col gap-5 text-center py-6">
                <span className="opacity-70 font-semibold">
                  Disponible: {sourceAccount ? formatMoney(sourceAccount.balance) : '—'}
                </span>
                <div className="flex items-center justify-center gap-2 text-5xl font-black">
                  <span>S/</span>
                  <input
                    type="number"
                    required
                    min="0.01"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-48 bg-transparent outline-none text-center"
                    autoFocus
                  />
                </div>
                <p className="opacity-60 text-sm">
                  Destino: <span className="font-mono">{destination}</span>
                </p>
              </div>
            </AnimateStep>

            <AnimateStep step={step} current={3}>
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Send size={40} className="ml-1" />
                </div>
                <h3 className="text-3xl font-bold mb-2">¡Transferencia Exitosa!</h3>
                <p className="opacity-70 text-lg">
                  Se enviaron {receipt ? formatMoney(receipt.amount) : ''} a {receipt?.destinationHolder}.
                </p>
                {receipt && (
                  <p className="opacity-50 text-sm mt-2 font-mono">Ref: {receipt.reference}</p>
                )}
                <button type="button" onClick={reset} className="mt-8 text-redbanck-main font-bold hover:underline">
                  Hacer otra transferencia
                </button>
              </div>
            </AnimateStep>

            {error && step < 3 && (
              <div className="mt-6 flex items-center gap-2 p-4 rounded-xl bg-red-500/10 text-red-500 text-sm font-semibold">
                <AlertCircle size={18} className="flex-shrink-0" /> {error}
              </div>
            )}

            {step < 3 && (
              <div className="mt-10 flex justify-between items-center">
                {step === 2 ? (
                  <button type="button" onClick={() => { setStep(1); setError(null); }} className="font-bold opacity-70 hover:opacity-100">
                    Volver
                  </button>
                ) : <span />}
                <button type="submit" disabled={sending || accounts.length === 0} className="px-8 py-4 bg-redbanck-main text-white rounded-xl font-bold flex items-center gap-2 shadow-lg hover:bg-red-700 transition-colors disabled:opacity-60">
                  {sending ? 'Enviando...' : (step === 2 ? 'Confirmar y Enviar' : 'Siguiente')} <ArrowRight size={20} />
                </button>
              </div>
            )}
          </form>

        </div>

        {/* Sidebar Info */}
        <div className="flex flex-col gap-6">
          <div className={clsx("p-6 rounded-3xl shadow-sm", isDark ? "bg-[#111111] border border-white/5" : "bg-white border border-black/5")}>
            <h3 className="font-bold mb-4">Mis Cuentas</h3>
            <div className="flex flex-col gap-4">
              {accounts.map(acc => (
                <div key={acc.id} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-redbanck-main/10 text-redbanck-main flex items-center justify-center font-bold flex-shrink-0">
                      {acc.alias.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{acc.alias}</p>
                      <p className="text-xs opacity-60 font-mono">{acc.maskedNumber}</p>
                    </div>
                  </div>
                  <span className="font-bold text-sm whitespace-nowrap">{formatMoney(acc.balance)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AnimateStep({ step, current, children }: { step: number; current: number; children: React.ReactNode }) {
  if (step !== current) return null;
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      {children}
    </motion.div>
  );
}
