import React, { useState } from 'react';
import { TripRecord, PartyProfile } from '../types';
import {
  formatInwardPickupWhatsApp,
  formatOutwardDeliveryWhatsApp,
  openWhatsAppDirect,
} from '../utils/whatsapp';
import { triggerPrintElement, downloadChallanFile } from '../utils/printer';
import {
  X,
  Printer,
  Copy,
  Check,
  Share2,
  Truck,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  Calendar,
  User,
  Download,
  Edit3,
} from 'lucide-react';

interface ChallanModalProps {
  trip: TripRecord | null;
  parties: PartyProfile[];
  partyBalance?: number;
  onClose: () => void;
  onUpdateTripPhone?: (tripId: string, phone: string) => void;
  onEditTrip?: (trip: TripRecord) => void;
}

export const ChallanModal: React.FC<ChallanModalProps> = ({
  trip,
  parties,
  partyBalance,
  onClose,
  onUpdateTripPhone,
  onEditTrip,
}) => {
  if (!trip) return null;

  const [activeView, setActiveView] = useState<'whatsapp' | 'print'>('whatsapp');
  const [copied, setCopied] = useState(false);

  // Match party phone
  const matchedParty = parties.find(
    (p) => p.name.trim().toLowerCase() === trip.khataName.trim().toLowerCase()
  );
  const initialPhone = trip.partyPhone || matchedParty?.phone || '';
  const [phone, setPhone] = useState(initialPhone);

  const isInward = trip.entryType === 'Inward';
  const whatsappText = isInward
    ? formatInwardPickupWhatsApp({ ...trip, partyPhone: phone }, partyBalance)
    : formatOutwardDeliveryWhatsApp({ ...trip, partyPhone: phone });

  const handleCopy = () => {
    navigator.clipboard.writeText(whatsappText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWhatsApp = () => {
    if (onUpdateTripPhone && phone !== trip.partyPhone) {
      onUpdateTripPhone(trip.id, phone);
    }
    openWhatsAppDirect(phone, whatsappText);
  };

  const handlePrint = () => {
    triggerPrintElement('printable-challan-slip');
  };

  const handleDownloadSlip = () => {
    downloadChallanFile(trip, 'printable-challan-slip');
  };

  const formattedDate = new Date(trip.date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] transition-colors">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 dark:bg-slate-950 text-white flex items-center justify-between border-b border-slate-800 no-print">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-xl ${
                isInward
                  ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                  : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
              }`}
            >
              {isInward ? (
                <ArrowDownLeft className="w-5 h-5" />
              ) : (
                <ArrowUpRight className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white">
                  {isInward ? 'Pipe Receipt Confirmation / પાઇપ પહોંચ' : 'Outward Delivery Challan / ડિલિવરી ચલણ'}
                </span>
                <span className="px-2 py-0.5 text-xs font-mono bg-slate-800 border border-slate-700 rounded-md text-slate-300">
                  {trip.challanNo}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isInward
                  ? 'ખાલી પાઇપ જમા પહોંચ (WhatsApp + Print Slip)'
                  : 'તૈયાર મોનો બીમ ડિલિવરી ચલણ'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-800 p-0.5 rounded-xl border border-slate-700">
              <button
                type="button"
                onClick={() => setActiveView('whatsapp')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  activeView === 'whatsapp'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                WhatsApp Message
              </button>
              <button
                type="button"
                onClick={() => setActiveView('print')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  activeView === 'print'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Print Slip (A4)
              </button>
            </div>

            {onEditTrip && (
              <button
                type="button"
                onClick={() => {
                  onEditTrip(trip);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl border border-slate-700 transition-colors cursor-pointer"
                title="Edit / Update Entry Details (વિગત સુધારો)"
              >
                <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline">Edit Entry</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 bg-slate-50 dark:bg-slate-950/60">
          {/* TAB 1: WHATSAPP VIEW */}
          {activeView === 'whatsapp' && (
            <div className="space-y-4">
              {/* Receipt Notification Banner */}
              {isInward && (
                <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 rounded-xl text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">
                      પાઇપ જમા સૂચના (Inward Receipt Notice)
                    </strong>
                    <span>
                      ખાલી પાઇપ ફેક્ટરીમાં જમા લેવાઈ ગઈ છે. નીચેથી સીધું પાર્ટીને WhatsApp પર વિગત મોકલો.
                    </span>
                  </div>
                </div>
              )}

              {/* Party Phone Input Bar */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Party WhatsApp Number (પાર્ટી મોબાઈલ નંબર)
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-2.5 text-slate-400 text-xs font-medium">
                      +
                    </span>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 919876543210 (Country code + 10 digits)"
                      className="w-full pl-7 pr-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSendWhatsApp}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors whitespace-nowrap cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Send to WhatsApp</span>
                  </button>
                </div>

                <div className="mt-2 flex flex-wrap items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>
                    Party: <strong className="text-slate-700 dark:text-slate-200">{trip.khataName}</strong>
                    {matchedParty?.location ? ` • ${matchedParty.location}` : ''}
                  </span>
                  {partyBalance !== undefined && (
                    <span className="text-blue-600 dark:text-blue-400 font-semibold font-mono">
                      Current Ledger Balance: {partyBalance} Pipes
                    </span>
                  )}
                </div>
              </div>

              {/* Summary Cards with Exact Required Items */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    {'{DATE}'}
                  </span>
                  <strong className="text-slate-800 dark:text-slate-100 text-xs font-mono-numbers block mt-1">
                    {formattedDate}
                  </strong>
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold">
                    {isInward ? '{PIPE QTY}' : '{ITEMS}'}
                  </span>
                  <strong className="text-blue-600 dark:text-blue-400 text-sm font-mono-numbers block mt-1">
                    {isInward ? `${trip.pipeCount} Pipes` : `${trip.beamCount}B + ${trip.pipeCount}P`}
                  </strong>
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                    <Truck className="w-3 h-3 text-slate-400" />
                    {'{TEMPO NUMBER}'}
                  </span>
                  <strong className="text-slate-800 dark:text-slate-100 text-xs font-mono block mt-1 truncate">
                    {trip.vehicleNumber}
                  </strong>
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-400" />
                    {'{RECEIVED BY}'}
                  </span>
                  <strong className="text-slate-800 dark:text-slate-100 text-xs block mt-1 truncate">
                    {trip.driver || trip.owner}
                  </strong>
                </div>
              </div>

              {/* Message Live Preview Box */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Live Formatted Confirmation Message:
                  </span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied to Clipboard!' : 'Copy Text'}</span>
                  </button>
                </div>
                <pre className="p-4 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 font-mono text-xs leading-relaxed whitespace-pre-wrap max-h-[260px] overflow-y-auto select-all shadow-inner">
                  {whatsappText}
                </pre>
              </div>

              {/* Quick Actions Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl cursor-pointer"
                    title="Direct Print Gate Pass Voucher"
                  >
                    <Printer className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Print Voucher (A4)</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadSlip}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl cursor-pointer"
                    title="Download clean HTML/PDF slip"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Download Slip</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl cursor-pointer"
                  >
                    {copied ? 'Copied!' : 'Copy Text'}
                  </button>
                  <button
                    type="button"
                    onClick={handleSendWhatsApp}
                    className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Send to WhatsApp</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRINT SLIP PREVIEW VIEW */}
          {activeView === 'print' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2 border-b border-slate-200 dark:border-slate-800 no-print">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Gate Pass Voucher Preview (A4 Standard Format)
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadSlip}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 shadow-2xs transition-colors cursor-pointer"
                    title="Download complete standalone printable slip as HTML/PDF"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Download Slip (HTML / PDF)</span>
                  </button>
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-500 shadow-sm transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Voucher Now</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PRINTABLE SLIP CONTAINER (Always in DOM so print works from both views!) */}
          <div
            className={`mt-4 ${
              activeView === 'print' ? 'block' : 'hidden'
            } print:block`}
          >
            <div
              id="printable-challan-slip"
              className="bg-white p-6 sm:p-8 rounded-xl border-2 border-slate-900 shadow-sm text-slate-900 print-card"
            >
              {/* Company Header */}
              <div className="border-b-2 border-slate-900 pb-4 mb-4 flex justify-between items-start">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                    ATMOS GROUP
                  </h1>
                  <p className="text-xs font-bold text-blue-900 mt-0.5">
                    MOTHER YARN SPLITTING & MONO YARN BEAMS
                  </p>
                  <p className="text-xs text-slate-500">
                    Hindva Industrial Area, Surat, Gujarat • Phone: +91 99255 79533
                  </p>
                </div>
                <div className="text-right">
                  <div
                    className={`inline-block px-3 py-1 text-xs font-extrabold uppercase tracking-wide border-2 ${
                      isInward
                        ? 'border-sky-700 text-sky-800 bg-sky-50'
                        : 'border-purple-700 text-purple-800 bg-purple-50'
                    }`}
                  >
                    {isInward ? 'INWARD PIPE RECEIPT' : 'OUTWARD DELIVERY CHALLAN'}
                  </div>
                  <div className="mt-2 text-xs font-mono font-bold text-slate-800">
                    RECEIPT NO: {trip.challanNo}
                  </div>
                  <div className="text-xs text-slate-600">DATE: {formattedDate}</div>
                </div>
              </div>

              {/* Party & Transport Details Grid */}
              <div className="grid grid-cols-2 gap-4 border border-slate-300 p-3 mb-4 rounded-lg text-xs bg-slate-50/70">
                <div>
                  <span className="font-bold text-slate-500 block text-[10px] uppercase">
                    Party / Khata Details
                  </span>
                  <strong className="text-sm font-bold text-slate-900 block mt-0.5">
                    {trip.khataName}
                  </strong>
                  <p className="text-slate-600 mt-0.5">
                    Pickup Location: <strong>{trip.pickup || 'Party Godown'}</strong>
                  </p>
                  {phone && <p className="text-slate-600 font-mono">Mobile: +{phone}</p>}
                </div>
                <div>
                  <span className="font-bold text-slate-500 block text-[10px] uppercase">
                    Transport & Reception
                  </span>
                  <p className="text-slate-800 font-medium mt-0.5">
                    Tempo No: <strong className="font-mono">{trip.vehicleNumber}</strong>
                  </p>
                  <p className="text-slate-800">
                    Received By / Driver: <strong>{trip.driver || trip.owner}</strong>
                  </p>
                  <p className="text-slate-600">
                    Destination: {trip.destination || 'ATMOS Plant (Hindva)'}
                  </p>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full border-collapse border border-slate-300 text-xs mb-4">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300">
                    <th className="border border-slate-300 p-2 text-left w-12 font-bold">Sr.</th>
                    <th className="border border-slate-300 p-2 text-left font-bold">
                      Particulars / Description
                    </th>
                    <th className="border border-slate-300 p-2 text-center w-28 font-bold">Type</th>
                    <th className="border border-slate-300 p-2 text-right w-24 font-bold">Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {isInward ? (
                    <>
                      <tr className="border-b border-slate-300">
                        <td className="border border-slate-300 p-2 font-mono">01</td>
                        <td className="border border-slate-300 p-2 font-medium">
                          Empty Weaver's Pipes (ખાલી પાઇપ)
                          <span className="block text-[11px] text-slate-500">
                            Received in sound condition for mother yarn splitting & beaming
                          </span>
                        </td>
                        <td className="border border-slate-300 p-2 text-center">Pipes (પાઇપ)</td>
                        <td className="border border-slate-300 p-2 text-right font-mono font-bold text-sm">
                          {trip.pipeCount}
                        </td>
                      </tr>
                      {trip.beamCount > 0 && (
                        <tr className="border-b border-slate-300">
                          <td className="border border-slate-300 p-2 font-mono">02</td>
                          <td className="border border-slate-300 p-2 font-medium">Beams Received</td>
                          <td className="border border-slate-300 p-2 text-center">Beams</td>
                          <td className="border border-slate-300 p-2 text-right font-mono font-bold text-sm">
                            {trip.beamCount}
                          </td>
                        </tr>
                      )}
                    </>
                  ) : (
                    <>
                      {trip.beamCount > 0 && (
                        <tr className="border-b border-slate-300">
                          <td className="border border-slate-300 p-2 font-mono">01</td>
                          <td className="border border-slate-300 p-2 font-medium">
                            Mono Yarn Beams (મોનો યાર્ન બીમ)
                            <span className="block text-[11px] text-slate-500">
                              High-tension split mono yarn beams ready for weaving
                            </span>
                          </td>
                          <td className="border border-slate-300 p-2 text-center">Mono Beams</td>
                          <td className="border border-slate-300 p-2 text-right font-mono font-bold text-sm">
                            {trip.beamCount}
                          </td>
                        </tr>
                      )}
                      {trip.pipeCount > 0 && (
                        <tr className="border-b border-slate-300">
                          <td className="border border-slate-300 p-2 font-mono">02</td>
                          <td className="border border-slate-300 p-2 font-medium">
                            Pipes (ખાલી પાઇપ)
                          </td>
                          <td className="border border-slate-300 p-2 text-center">Pipes</td>
                          <td className="border border-slate-300 p-2 text-right font-mono font-bold text-sm">
                            {trip.pipeCount}
                          </td>
                        </tr>
                      )}
                    </>
                  )}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 font-bold border-t-2 border-slate-800">
                    <td colSpan={3} className="border border-slate-300 p-2 text-right">
                      TOTAL ITEMS:
                    </td>
                    <td className="border border-slate-300 p-2 text-right font-mono text-sm">
                      {isInward ? trip.pipeCount : trip.beamCount + trip.pipeCount}
                    </td>
                  </tr>
                </tfoot>
              </table>

              {/* Remarks & Notes */}
              <div className="border border-slate-200 p-3 rounded-lg mb-6 text-xs bg-slate-50">
                <strong>Remark / નોંધ: </strong>
                <span className="text-slate-700">
                  {trip.remark || 'Pipes received in good physical condition for Mother Yarn Splitting & Mono Yarn Beaming.'}
                </span>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-300 text-center text-xs">
                <div>
                  <div className="h-14 border-b border-dashed border-slate-400 mb-1"></div>
                  <span className="font-bold text-slate-800">Receiver's Signature</span>
                  <span className="block text-[10px] text-slate-500">(Party Seal & Sign)</span>
                </div>
                <div>
                  <div className="h-14 border-b border-dashed border-slate-400 mb-1"></div>
                  <span className="font-bold text-slate-800">Driver's Signature</span>
                  <span className="block text-[10px] text-slate-500">(Tempo In-Charge)</span>
                </div>
                <div>
                  <div className="h-14 border-b border-dashed border-slate-400 mb-1"></div>
                  <span className="font-bold text-slate-800">For ATMOS GROUP</span>
                  <span className="block text-[10px] text-slate-500">(Authorized Signatory)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
