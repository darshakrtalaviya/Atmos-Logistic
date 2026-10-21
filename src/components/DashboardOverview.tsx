import React from 'react';
import { TripRecord, PartyProfile, EntryType } from '../types';
import { ActiveTab } from './Navbar';
import {
  Layers,
  Calculator,
  ArrowDownLeft,
  ArrowUpRight,
  Share2,
  Clock,
  Building,
  PackagePlus,
  Edit3,
} from 'lucide-react';

interface DashboardOverviewProps {
  trips: TripRecord[];
  parties: PartyProfile[];
  setActiveTab: (tab: ActiveTab) => void;
  onOpenChallan: (trip: TripRecord) => void;
  onQuickNewChalan: (type: EntryType) => void;
  onOpenEditTrip?: (trip: TripRecord) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  trips,
  parties,
  setActiveTab,
  onOpenChallan,
  onQuickNewChalan,
  onOpenEditTrip,
}) => {
  // Compute KPIs: Outward Items = Outward Pipes + Outward Beams
  const totalInwardPipes = trips
    .filter((t) => t.entryType === 'Inward')
    .reduce((s, t) => s + (t.pipeCount || 0), 0);

  const totalOutwardBeams = trips
    .filter((t) => t.entryType === 'Outward')
    .reduce((s, t) => s + (t.beamCount || 0), 0);

  const totalOutwardPipes = trips
    .filter((t) => t.entryType === 'Outward')
    .reduce((s, t) => s + (t.pipeCount || 0), 0);

  const totalOutwardItems = totalOutwardPipes + totalOutwardBeams;
  const totalDue = trips.reduce((s, t) => s + (t.due || 0), 0);

  // Plant Pipe Balance = Total Inward Pipes - Total Outward Items (Pipes + Beams)
  const netPipesBalance = totalInwardPipes - totalOutwardItems;

  // Recent trips
  const recentTrips = [...trips]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  // Party overview
  const partyStats = parties.map((party) => {
    const partyTrips = trips.filter(
      (t) => t.khataName.toLowerCase() === party.name.toLowerCase()
    );
    const inPipes = partyTrips
      .filter((t) => t.entryType === 'Inward')
      .reduce((s, t) => s + (t.pipeCount || 0), 0);
    const outItems = partyTrips
      .filter((t) => t.entryType === 'Outward')
      .reduce((s, t) => s + (t.beamCount || 0) + (t.pipeCount || 0), 0);
    return {
      party,
      balance: inPipes - outItems,
      totalTrips: partyTrips.length,
    };
  });

  return (
    <div className="space-y-6">
      {/* Modern Operations Banner with prominent Receive Pipes CTA */}
      <div className="relative overflow-hidden rounded-2xl p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 dark:from-slate-950 dark:via-blue-950/70 dark:to-slate-950 text-white border border-slate-800 dark:border-slate-800 shadow-sm">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Mother Yarn Splitting & Mono Beam Operations
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
            ATMOS Mother Yarn Splitting & Mono Beam ERP
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 dark:text-slate-300 mt-2 leading-relaxed">
            કાચો માલ (Mother Yarn) સ્પ્લિટિંગ અને મોનો યાર્ન (Mono Yarn) બીમ પ્રોડક્શન કંટ્રોલ, ડિલિવરી ચલણ, ખાલી પાઇપ આવક-જાવક અને WhatsApp દ્વારા તાત્કાલિક પહોંચ.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button
              type="button"
              onClick={() => onQuickNewChalan('Inward')}
              className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer ring-2 ring-emerald-400/30"
            >
              <PackagePlus className="w-4 h-4 text-white" />
              <span>📥 Receive Party Pipes (પાઇપ જમા લો)</span>
            </button>
            <button
              type="button"
              onClick={() => onQuickNewChalan('Outward')}
              className="inline-flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>📤 Outward Delivery (બીમ ડિલિવરી)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('calculator')}
              className="inline-flex items-center gap-2 px-4 py-3 bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700/80 transition-colors cursor-pointer"
            >
              <Calculator className="w-4 h-4 text-blue-400" />
              <span>Splitting Calc</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Inward Card */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Inward Pipes Received</span>
            <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-800/40">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <strong className="text-2xl font-black font-mono-numbers text-slate-900 dark:text-white block mt-3">
            {totalInwardPipes} Pipes
          </strong>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
            જમા ખાલી પાઇપ
          </span>
        </div>

        {/* Outward Card */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Outward (Pipes + Beams)</span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-800/40">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <strong className="text-2xl font-black font-mono-numbers text-slate-900 dark:text-white block mt-3">
            {totalOutwardItems} Items
          </strong>
          <span className="text-[11px] text-purple-700 dark:text-purple-300 font-medium mt-1 block">
            {totalOutwardBeams} Beams + {totalOutwardPipes} Pipes
          </span>
        </div>

        {/* Plant Balance Card */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Plant Pipe Inventory</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/40">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <strong className="text-2xl font-black font-mono-numbers text-blue-600 dark:text-blue-400 block mt-3">
            {netPipesBalance} Pipes
          </strong>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
            ફેક્ટરીમાં બાકી પાઇપ સ્ટોક
          </span>
        </div>

        {/* Due Balance Card */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Transport Due Balance</span>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-800/40">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <strong className="text-2xl font-black font-mono-numbers text-rose-600 dark:text-rose-400 block mt-3">
            ₹{totalDue.toLocaleString('en-IN')}
          </strong>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
            ટેમ્પો ભાડું બાકી રકમ
          </span>
        </div>
      </div>

      {/* Main Grid: Recent Challans & Parties Balance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Dispatches & Pickups (8 Cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4 transition-colors">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Recent Chalans & WhatsApp Confirmations (તાજેતરના ચલણ)
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Click WhatsApp button to immediately send confirmation receipt to party
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('tempo')}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              View All ({trips.length}) →
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-xs text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-bold">
                  <th className="py-3 px-3">Challan No.</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Party Name</th>
                  <th className="py-3 px-3">Vehicle & Driver</th>
                  <th className="py-3 px-3 text-center">Pipes</th>
                  <th className="py-3 px-3 text-center">Beams</th>
                  <th className="py-3 px-3 text-center">Party Confirmation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentTrips.map((trip) => {
                  const isInward = trip.entryType === 'Inward';
                  return (
                    <tr
                      key={trip.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-2.5 px-3">
                        <span className="font-mono font-bold text-slate-900 dark:text-white block">
                          {trip.challanNo}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono-numbers">
                          {trip.date}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            isInward
                              ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/50'
                              : 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50'
                          }`}
                        >
                          {isInward ? (
                            <ArrowDownLeft className="w-3 h-3" />
                          ) : (
                            <ArrowUpRight className="w-3 h-3" />
                          )}
                          <span>{trip.entryType}</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-slate-100">
                        {trip.khataName}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-700 dark:text-slate-300">
                        <span>{trip.vehicleNumber}</span>
                        <span className="text-[10px] text-slate-400 block font-sans">
                          {trip.driver || trip.owner}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-blue-600 dark:text-blue-400">
                        {trip.pipeCount > 0 ? trip.pipeCount : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-purple-600 dark:text-purple-400">
                        {trip.beamCount > 0 ? trip.beamCount : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onOpenChallan(trip)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg shadow-2xs transition-colors cursor-pointer ${
                              isInward
                                ? 'text-emerald-900 dark:text-emerald-200 bg-emerald-100 dark:bg-emerald-950/80 hover:bg-emerald-200 dark:hover:bg-emerald-900 border border-emerald-300 dark:border-emerald-700'
                                : 'text-purple-900 dark:text-purple-200 bg-purple-100 dark:bg-purple-950/80 hover:bg-purple-200 dark:hover:bg-purple-900 border border-purple-300 dark:border-purple-700'
                            }`}
                          >
                            <Share2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            <span>{isInward ? 'Pipe Receipt' : 'Delivery Chalan'}</span>
                          </button>
                          {onOpenEditTrip && (
                            <button
                              type="button"
                              onClick={() => onOpenEditTrip(trip)}
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 rounded-lg cursor-pointer transition-colors shadow-2xs"
                              title="Edit / Update Entry (વિગત સુધારો)"
                            >
                              <Edit3 className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                              <span className="hidden sm:inline">સુધારો</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Party Wise Pipe Inventory (4 Cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4 transition-colors">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Building className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Party Pipe Balances (પાર્ટી પાઇપ બેલેન્સ)</span>
            </h2>
            <button
              type="button"
              onClick={() => setActiveTab('statement')}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              Ledger →
            </button>
          </div>

          <div className="space-y-2.5">
            {partyStats.map(({ party, balance, totalTrips }) => (
              <div
                key={party.id}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800/80 transition-colors flex items-center justify-between text-xs"
              >
                <div>
                  <strong className="text-slate-900 dark:text-slate-100 font-bold block">
                    {party.name}
                  </strong>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {party.location} • {totalTrips} Trips
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Balance:</span>
                  <span
                    className={`font-mono font-bold text-sm ${
                      balance > 0
                        ? 'text-blue-600 dark:text-blue-400'
                        : balance < 0
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {balance > 0 ? `+${balance}` : balance} Pipes
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('directory')}
              className="w-full py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors text-center cursor-pointer"
            >
              Manage Parties & Contacts
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
