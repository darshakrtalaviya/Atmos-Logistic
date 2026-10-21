import React, { useRef, useState } from 'react';
import { TripRecord, PaymentRecord } from '../types';
import { generateCSVContent, parseCSVContent } from '../utils/storage';
import {
  X,
  Download,
  Upload,
  Database,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

interface CsvManagerModalProps {
  trips: TripRecord[];
  payments: PaymentRecord[];
  onImportSuccess: (trips: TripRecord[], payments: PaymentRecord[]) => void;
  onClose: () => void;
}

export const CsvManagerModal: React.FC<CsvManagerModalProps> = ({
  trips,
  payments,
  onImportSuccess,
  onClose,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const handleDownloadCSV = () => {
    const csv = generateCSVContent(trips, payments);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TEMPO_REGISTER_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setStatusMessage('CSV downloaded successfully with all trips and payments.');
    setIsError(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseCSVContent(text);
        if (parsed.trips.length === 0 && parsed.payments.length === 0) {
          setStatusMessage('No valid trip or payment records found in this CSV.');
          setIsError(true);
          return;
        }
        onImportSuccess(parsed.trips, parsed.payments);
        setStatusMessage(
          `Successfully loaded ${parsed.trips.length} trips and ${parsed.payments.length} payments from CSV!`
        );
        setIsError(false);
      } catch (err: any) {
        setStatusMessage(`Could not parse CSV: ${err.message || 'Invalid format'}`);
        setIsError(true);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 dark:bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-400" />
            <h2 className="font-bold text-base tracking-tight">CSV Backup & Synchronization</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs">
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            Your data is automatically saved in your browser. You can export your full database as a
            standard <code className="bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded font-mono">TEMPO_REGISTER.csv</code> file or load an existing CSV at any time.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleDownloadCSV}
              className="flex flex-col items-center justify-center p-5 rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/60 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-900 dark:text-blue-200 font-bold transition-all gap-2 cursor-pointer"
            >
              <Download className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <span>Download CSV</span>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-normal">
                Export all {trips.length} trips
              </span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center p-5 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/60 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-900 dark:text-emerald-200 font-bold transition-all gap-2 cursor-pointer"
            >
              <Upload className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              <span>Import / Replace CSV</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-normal">
                Load TEMPO_REGISTER.csv
              </span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv,text/csv"
              onChange={handleFileChange}
              hidden
            />
          </div>

          {statusMessage && (
            <div
              className={`p-3.5 rounded-xl flex items-start gap-2 ${
                isError
                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800'
                  : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
              }`}
            >
              {isError ? (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              )}
              <span className="font-medium">{statusMessage}</span>
            </div>
          )}

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 space-y-1 text-[11px]">
            <div className="font-bold text-slate-700 dark:text-slate-300">
              Supported CSV Header Structure:
            </div>
            <div className="font-mono text-[10px] overflow-x-auto">
              Record Type, Date, Type, Khata Name, Vehicle No., Owner, Driver, Pickup, Destination, Pipes, Beams, Fare, Payment Amount, Remark
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
