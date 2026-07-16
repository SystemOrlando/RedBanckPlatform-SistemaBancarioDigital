import { useEffect, useState } from 'react';
import { useTheme } from '../hooks/useTheme';
import clsx from 'clsx';
import { ShieldAlert, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { getLimits, updateLimits } from '../features/limits/api';
import { getApiErrorMessage } from '../services/api';
import type { LimitsDto } from '../types/api';
import { formatMoney } from '../utils/format';

export default function Limits() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [limits, setLimits] = useState<LimitsDto | null>(null);
  const [perTransfer, setPerTransfer] = useState(0);
  const [daily, setDaily] = useState(0);
  const [monthly, setMonthly] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getLimits()
      .then(l => {
        setLimits(l);
        setPerTransfer(l.maxPerTransfer);
        setDaily(l.dailyTransferLimit);
        setMonthly(l.monthlyTransferLimit);
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setError(null);
    setSaved(false);
    setSaving(true);
    try {
      const updated = await updateLimits(perTransfer, daily, monthly);
      setLimits(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (!limits) {
    return <p className="opacity-60 max-w-4xl mx-auto">Cargando límites...</p>;
  }

  const sliders = [
    {
      title: 'Monto por Transferencia',
      desc: 'Máximo permitido en una sola operación.',
      value: perTransfer,
      set: setPerTransfer,
      max: limits.maxPerTransferCap,
    },
    {
      title: 'Transferencias Diarias',
      desc: 'Monto máximo acumulado por día.',
      value: daily,
      set: setDaily,
      max: limits.dailyCap,
    },
    {
      title: 'Transferencias Mensuales',
      desc: 'Monto máximo acumulado por mes.',
      value: monthly,
      set: setMonthly,
      max: limits.monthlyCap,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-redbanck-main/10 text-redbanck-main flex items-center justify-center">
          <ShieldAlert size={24} />
        </div>
        <div>
          <h2 className="text-3xl font-bold">Límites de Operación</h2>
          <p className="opacity-70 mt-1">Configura los montos máximos por seguridad.</p>
        </div>
      </div>

      <div className={clsx("p-8 rounded-3xl shadow-sm flex flex-col gap-10", isDark ? "bg-[#111111] border border-white/5" : "bg-white border border-black/5")}>
        {sliders.map((s, i) => (
          <div key={s.title}>
            {i > 0 && <div className="w-full h-px bg-black/5 dark:bg-white/5 mb-10" />}
            <div className="flex justify-between items-end mb-4">
              <div>
                <h3 className="text-xl font-bold">{s.title}</h3>
                <p className="opacity-70 text-sm">{s.desc}</p>
              </div>
              <span className="text-2xl font-black text-redbanck-main">{formatMoney(s.value)}</span>
            </div>
            <input
              type="range"
              min={100}
              max={s.max}
              step={100}
              value={s.value}
              onChange={(e) => s.set(Number(e.target.value))}
              className="w-full h-2 bg-black/10 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-redbanck-main"
            />
            <div className="flex justify-between mt-2 opacity-50 text-xs font-bold">
              <span>{formatMoney(100)}</span>
              <span>{formatMoney(s.max)}</span>
            </div>
          </div>
        ))}

        {error && (
          <div className="flex items-center gap-2 p-4 rounded-xl bg-red-500/10 text-red-500 text-sm font-semibold">
            <AlertCircle size={18} className="flex-shrink-0" /> {error}
          </div>
        )}
        {saved && (
          <div className="flex items-center gap-2 p-4 rounded-xl bg-green-500/10 text-green-500 text-sm font-semibold">
            <CheckCircle2 size={18} className="flex-shrink-0" /> Límites actualizados correctamente.
          </div>
        )}

        <div className="flex justify-end">
          <button onClick={handleSave} disabled={saving} className="px-8 py-4 bg-redbanck-main text-white rounded-xl font-bold flex items-center gap-2 shadow-lg hover:bg-red-700 transition-colors disabled:opacity-60">
            <Save size={20} /> {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </div>
  );
}
