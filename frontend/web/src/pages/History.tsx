import { useCallback, useEffect, useState } from 'react';
import { useTheme } from '../hooks/useTheme';
import clsx from 'clsx';
import { Search, Download, ArrowUpRight, ArrowDownRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { searchTransactions } from '../features/history/api';
import type { Page, TransactionDto, TransactionType } from '../types/api';
import { formatMoney, formatDateTime } from '../utils/format';

const TYPE_LABEL: Record<TransactionType, string> = {
  DEPOSIT: 'Depósito',
  TRANSFER_IN: 'Transferencia Recibida',
  TRANSFER_OUT: 'Transferencia Enviada',
};

export default function History() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [pageData, setPageData] = useState<Page<TransactionDto> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [type, setType] = useState<TransactionType | ''>('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    searchTransactions({
      page,
      size: 15,
      type: type || undefined,
      from: from || undefined,
      to: to || undefined,
    })
      .then(setPageData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, type, from, to]);

  useEffect(() => { load(); }, [load]);

  const rows = (pageData?.content ?? []).filter(tx => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (tx.description ?? '').toLowerCase().includes(term) ||
      (tx.counterpartyName ?? '').toLowerCase().includes(term) ||
      tx.amount.toString().includes(term)
    );
  });

  const exportCsv = () => {
    const header = 'Fecha,Tipo,Concepto,Contraparte,Monto,Saldo posterior,Referencia';
    const lines = rows.map(tx => [
      new Date(tx.createdAt).toISOString(),
      TYPE_LABEL[tx.type],
      `"${(tx.description ?? '').replace(/"/g, '""')}"`,
      `"${(tx.counterpartyName ?? '').replace(/"/g, '""')}"`,
      (tx.type === 'TRANSFER_OUT' ? -tx.amount : tx.amount).toFixed(2),
      tx.balanceAfter.toFixed(2),
      tx.reference,
    ].join(','));
    const blob = new Blob(['﻿' + [header, ...lines].join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `movimientos-redbanck-p${page + 1}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const inputClass = clsx(
    "h-12 px-4 rounded-xl font-medium outline-none transition-all",
    isDark ? "bg-black/20 focus:bg-black/40 text-white placeholder-white/40" : "bg-black/5 focus:bg-black/10 text-black placeholder-black/40"
  );

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold">Historial de Movimientos</h2>
          <p className="opacity-70 mt-1">Revisa el detalle de todas tus operaciones.</p>
        </div>
        <button onClick={exportCsv} className={clsx("px-4 py-2 rounded-xl flex items-center gap-2 font-semibold shadow-sm transition-colors", isDark ? "bg-[#111111] hover:bg-[#222222] border border-white/10" : "bg-white hover:bg-black/5 border border-black/10")}>
          <Download size={18} /> Exportar CSV
        </button>
      </div>

      <div className={clsx("p-6 rounded-3xl shadow-sm mb-6 flex flex-col lg:flex-row gap-4", isDark ? "bg-[#111111] border border-white/5" : "bg-white border border-black/5")}>
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50" size={20} />
          <input
            type="text"
            placeholder="Buscar por concepto, contraparte o monto..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className={clsx(inputClass, "w-full pl-12")}
          />
        </div>
        <select
          value={type}
          onChange={e => { setType(e.target.value as TransactionType | ''); setPage(0); }}
          className={inputClass}
        >
          <option value="">Todos los tipos</option>
          <option value="TRANSFER_IN">Recibidas</option>
          <option value="TRANSFER_OUT">Enviadas</option>
          <option value="DEPOSIT">Depósitos</option>
        </select>
        <input type="date" value={from} onChange={e => { setFrom(e.target.value); setPage(0); }} className={inputClass} />
        <input type="date" value={to} onChange={e => { setTo(e.target.value); setPage(0); }} className={inputClass} />
      </div>

      <div className={clsx("rounded-3xl shadow-sm overflow-hidden", isDark ? "bg-[#111111] border border-white/5" : "bg-white border border-black/5")}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={clsx("border-b", isDark ? "border-white/10 text-white/50" : "border-black/5 text-black/50")}>
                <th className="p-4 font-semibold text-sm">Fecha</th>
                <th className="p-4 font-semibold text-sm">Concepto</th>
                <th className="p-4 font-semibold text-sm">Contraparte</th>
                <th className="p-4 font-semibold text-sm">Referencia</th>
                <th className="p-4 font-semibold text-sm text-right">Monto</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={5} className="p-8 text-center opacity-60">Cargando movimientos...</td></tr>
              )}
              {!loading && rows.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center opacity-60">No se encontraron movimientos.</td></tr>
              )}
              {!loading && rows.map((tx) => {
                const isOut = tx.type === 'TRANSFER_OUT';
                return (
                  <tr key={tx.id} className={clsx("border-b last:border-0 hover:bg-black/5 dark:hover:bg-white/5 transition-colors", isDark ? "border-white/5" : "border-black/5")}>
                    <td className="p-4 opacity-80 text-sm whitespace-nowrap">{formatDateTime(tx.createdAt)}</td>
                    <td className="p-4 font-semibold">
                      <div className="flex items-center gap-3">
                        <div className={clsx("w-8 h-8 rounded-full flex flex-shrink-0 items-center justify-center", isOut ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500")}>
                          {isOut ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
                        </div>
                        <div>
                          <p>{tx.description || TYPE_LABEL[tx.type]}</p>
                          <p className="text-xs opacity-50 font-normal">{TYPE_LABEL[tx.type]}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm opacity-80">{tx.counterpartyName ?? '—'}</td>
                    <td className="p-4 opacity-60 text-sm font-mono">{tx.reference.slice(0, 8)}</td>
                    <td className={clsx("p-4 font-bold text-right whitespace-nowrap", isOut ? "" : "text-green-500")}>
                      {isOut ? '-' : '+'}{formatMoney(tx.amount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {pageData && pageData.totalPages > 1 && (
          <div className={clsx("flex items-center justify-between px-6 py-4 border-t", isDark ? "border-white/10" : "border-black/5")}>
            <span className="text-sm opacity-60">
              Página {pageData.number + 1} de {pageData.totalPages} · {pageData.totalElements} movimientos
            </span>
            <div className="flex gap-2">
              <button
                disabled={pageData.first}
                onClick={() => setPage(p => p - 1)}
                className={clsx("p-2 rounded-lg transition-colors disabled:opacity-30", isDark ? "hover:bg-white/10" : "hover:bg-black/5")}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                disabled={pageData.last}
                onClick={() => setPage(p => p + 1)}
                className={clsx("p-2 rounded-lg transition-colors disabled:opacity-30", isDark ? "hover:bg-white/10" : "hover:bg-black/5")}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
