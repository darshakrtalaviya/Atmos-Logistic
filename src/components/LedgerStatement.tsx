import React, { useState, useMemo } from 'react';
import { TripRecord, PartyProfile } from '../types';
import { triggerPrintElement } from '../utils/printer';
import {
  FileSpreadsheet,
  Printer,
  RotateCcw,
  ArrowDownLeft,
  ArrowUpRight,
  Filter,
  Download,
} from 'lucide-react';

interface LedgerStatementProps {
  trips: TripRecord[];
  parties: PartyProfile[];
}

export const LedgerStatement: React.FC<LedgerStatementProps> = ({ trips, parties }) => {
  const [khataFilter, setKhataFilter] = useState<string>('');
  const [ownerFilter, setOwnerFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  const uniqueKhatas = useMemo(() => {
    return Array.from(new Set(trips.map((t) => t.khataName.trim()).filter(Boolean))).sort();
  }, [trips]);

  const uniqueOwners = useMemo(() => {
    return Array.from(new Set(trips.map((t) => t.owner.trim()).filter(Boolean))).sort();
  }, [trips]);

  const filteredTrips = useMemo(() => {
    return trips.filter((r) => {
      const matchKhata = !khataFilter || r.khataName.toLowerCase() === khataFilter.toLowerCase();
      const matchOwner = !ownerFilter || r.owner.toLowerCase() === ownerFilter.toLowerCase();
      const matchType = !typeFilter || r.entryType.toLowerCase() === typeFilter.toLowerCase();
      const matchDate =
        (!fromDate || r.date >= fromDate) && (!toDate || r.date <= toDate);
      return matchKhata && matchOwner && matchType && matchDate;
    });
  }, [trips, khataFilter, ownerFilter, typeFilter, fromDate, toDate]);

  // Balance calculation
  const statementSummary = useMemo(() => {
    let pool = trips;
    if (khataFilter) {
      pool = pool.filter((r) => r.khataName.toLowerCase() === khataFilter.toLowerCase());
    }
    if (ownerFilter) {
      pool = pool.filter((r) => r.owner.toLowerCase() === ownerFilter.toLowerCase());
    }

    let totalInPipes = 0;
    let totalOutItems = 0;

    pool.forEach((r) => {
      const p = Number(r.pipeCount) || 0;
      const b = Number(r.beamCount) || 0;
      if (r.entryType === 'Outward') {
        totalOutItems += p + b;
      } else {
        totalInPipes += p;
      }
    });

    return {
      totalInPipes,
      totalOutItems,
      currentBalance: totalInPipes - totalOutItems,
    };
  }, [trips, khataFilter, ownerFilter]);

  const handleReset = () => {
    setKhataFilter('');
    setOwnerFilter('');
    setTypeFilter('');
    setFromDate('');
    setToDate('');
  };

  const handlePrint = () => {
    triggerPrintElement('printable-statement');
  };

  const handleDownloadStatement = () => {
    const element = document.getElementById('printable-statement');
    const content = element ? element.innerHTML : '';
    const partyLabel = khataFilter ? khataFilter.replace(/[^a-zA-Z0-9]/g, '_') : 'ALL_PARTIES';

    const html = `<!DOCTYPE html>
<html lang="gu">
<head>
  <meta charset="utf-8">
  <title>STATEMENT_${partyLabel}_ATMOS_GROUP</title>
  <style>
    @page { size: A4 landscape; margin: 8mm; }
    body { font-family: system-ui, -apple-system, sans-serif; margin: 15px auto; max-width: 1000px; padding: 20px; background: #fff; color: #000; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 10px; font-size: 11px; }
    th, td { border: 1px solid #334155; padding: 6px 8px; text-align: left; }
    th { background: #f1f5f9; }
    .print-actions { margin-bottom: 16px; }
    .print-btn { padding: 8px 16px; font-weight: bold; background: #2563eb; color: #fff; border: none; border-radius: 6px; cursor: pointer; }
    @media print { .print-actions { display: none; } body { padding: 0; } }
  </style>
</head>
<body>
  <div class="print-actions">
    <button class="print-btn" onclick="window.print()">🖨️ Print Statement (A4 પ્રિન્ટ)</button>
  </div>
  ${content}
  <script>
    window.addEventListener('DOMContentLoaded', () => { setTimeout(() => window.print(), 400); });
  </script>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `STATEMENT_${partyLabel}_${new Date().toISOString().slice(0, 10)}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800 no-print">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Khata Ledger Statement (ખાતા સ્ટેટમેન્ટ)</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Audit trail of pipes received (+) vs pipes & beams dispatched (-), outstanding pipe balance
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
          <button
            type="button"
            onClick={handleDownloadStatement}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-lg transition-colors cursor-pointer"
            title="Download statement as HTML / PDF"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Download</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Statement (A4)</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs no-print space-y-3 transition-colors">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
          <Filter className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          <span>Statement Filters (ફિલ્ટર કરો)</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
              Select Khata
            </label>
            <select
              value={khataFilter}
              onChange={(e) => setKhataFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium"
            >
              <option value="">-- All Khatas --</option>
              {uniqueKhatas.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
              Tempo Owner
            </label>
            <select
              value={ownerFilter}
              onChange={(e) => setOwnerFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium"
            >
              <option value="">-- All Owners --</option>
              {uniqueOwners.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
              Entry Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium"
            >
              <option value="">-- All Types --</option>
              <option value="Inward">Inward (આવક પાઇપ)</option>
              <option value="Outward">Outward (જાવક બીમ+પાઇપ)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
              From Date
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg font-mono-numbers outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
              To Date
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg font-mono-numbers outline-none"
            />
          </div>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-slate-500 dark:text-slate-400 text-xs block font-medium">
            Total Pipes Inward (કુલ પાઇપ આવક) (+)
          </span>
          <strong className="text-blue-600 dark:text-blue-400 text-3xl font-black font-mono-numbers block mt-2">
            {statementSummary.totalInPipes}
          </strong>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-slate-500 dark:text-slate-400 text-xs block font-medium">
            Total Outward Dispatched (Pipes + Beams) (-)
          </span>
          <strong className="text-purple-600 dark:text-purple-400 text-3xl font-black font-mono-numbers block mt-2">
            {statementSummary.totalOutItems}
          </strong>
        </div>

        <div className="bg-blue-50/80 dark:bg-blue-950/40 p-5 rounded-2xl border border-blue-200 dark:border-blue-800/80 shadow-2xs">
          <span className="text-blue-800 dark:text-blue-300 text-xs block font-medium">
            Current Outstanding Balance (બાકી પાઇપ સ્ટોક)
          </span>
          <strong className="text-blue-900 dark:text-blue-200 text-3xl font-black font-mono-numbers block mt-2">
            {statementSummary.currentBalance} Pipes
          </strong>
        </div>
      </div>

      {/* Printable Statement Document */}
      <div
        id="printable-statement"
        className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs print-card transition-colors"
      >
        {/* Print Header */}
        <div className="hidden print:block pb-4 mb-4 border-b-2 border-slate-900">
          <h1 className="text-xl font-black">
            ATMOS GROUP - MOTHER YARN SPLITTING & MONO BEAMS STATEMENT
          </h1>
          <p className="text-xs">
            Khata: {khataFilter || 'ALL KHATAS'} | Period:{' '}
            {fromDate ? fromDate : 'Inception'} to {toDate ? toDate : 'Present'}
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-xs text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 font-bold">
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Khata Name</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Vehicle No.</th>
                <th className="py-3 px-3">Owner</th>
                <th className="py-3 px-3 text-center text-blue-600 dark:text-blue-400">
                  Pipes In (+)
                </th>
                <th className="py-3 px-3 text-center text-purple-600 dark:text-purple-400">
                  Outward (P+B) (-)
                </th>
                <th className="py-3 px-3 text-center">Beams</th>
                <th className="py-3 px-3">Remark</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTrips.map((r) => {
                const isOut = r.entryType === 'Outward';
                const p = Number(r.pipeCount) || 0;
                const b = Number(r.beamCount) || 0;
                const outTotal = isOut ? p + b : 0;
                const inTotal = isOut ? 0 : p;

                return (
                  <tr
                    key={r.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-2.5 px-3 font-mono-numbers text-slate-700 dark:text-slate-300">
                      {r.date}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-slate-100">
                      {r.khataName}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          isOut
                            ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                            : 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300'
                        }`}
                      >
                        {isOut ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownLeft className="w-3 h-3" />}
                        <span>{r.entryType}</span>
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-700 dark:text-slate-300">
                      {r.vehicleNumber}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">{r.owner}</td>
                    <td className="py-2.5 px-3 text-center font-mono-numbers font-bold text-blue-600 dark:text-blue-400">
                      {inTotal > 0 ? inTotal : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono-numbers font-bold text-purple-600 dark:text-purple-400">
                      {outTotal > 0 ? outTotal : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono-numbers text-slate-600 dark:text-slate-400">
                      {b > 0 ? b : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400 max-w-[220px] truncate">
                      {r.remark || '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 dark:bg-slate-800 font-bold border-t-2 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100">
                <td colSpan={5} className="py-3 px-3 text-right">
                  SUMMARY TOTALS:
                </td>
                <td className="py-3 px-3 text-center font-mono text-blue-700 dark:text-blue-400">
                  {statementSummary.totalInPipes}
                </td>
                <td className="py-3 px-3 text-center font-mono text-purple-700 dark:text-purple-400">
                  {statementSummary.totalOutItems}
                </td>
                <td colSpan={2} className="py-3 px-3 text-slate-700 dark:text-slate-300 text-right">
                  Net Balance:{' '}
                  <span className="text-blue-600 dark:text-blue-400 font-mono text-sm">
                    {statementSummary.currentBalance} Pipes
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
          {filteredTrips.length === 0 && (
            <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">
              No transactions match the selected filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
