import React, { useState, useEffect } from 'react';
import { DealData, BeamQuality, PartyProfile } from '../types';
import { formatDealMessage, openWhatsAppDirect } from '../utils/whatsapp';
import {
  MessageSquareText,
  Plus,
  Trash2,
  Copy,
  Check,
  Share2,
  Building,
  Layers,
  Sparkles,
} from 'lucide-react';

interface DealMessageBuilderProps {
  initialDeal?: DealData;
  parties: PartyProfile[];
  onSaveDeal?: (deal: DealData) => void;
  presetData?: { ends?: string; panno?: string };
}

export const DealMessageBuilder: React.FC<DealMessageBuilderProps> = ({
  initialDeal,
  parties,
  onSaveDeal,
  presetData,
}) => {
  const [partyAddress, setPartyAddress] = useState(initialDeal?.partyAddress || 'ADLON TEXTILE');
  const [partyLocation, setPartyLocation] = useState(initialDeal?.partyLocation || 'UMBHEL');
  const [whatsappNumber, setWhatsappNumber] = useState(initialDeal?.whatsappNumber || '919925579533');
  const [paymentDays, setPaymentDays] = useState(initialDeal?.paymentDays || 20);
  const [transportationOption, setTransportationOption] = useState(
    initialDeal?.transportationOption || false
  );
  const [gstOption, setGstOption] = useState(initialDeal?.gstOption || false);
  const [beams, setBeams] = useState<BeamQuality[]>(
    initialDeal?.beams || [
      {
        id: 'b-1',
        itemName: '21/1 SD POLY MONO',
        ends: '2400',
        panno: '48',
        beamQty: 8,
        meterPerBeam: 2000,
        rate: '295',
      },
    ]
  );
  const [copied, setCopied] = useState(false);

  // Auto preset if passed from calculator
  useEffect(() => {
    if (presetData?.ends || presetData?.panno) {
      setBeams((prev) => {
        if (prev.length === 0) return prev;
        const updated = [...prev];
        updated[0] = {
          ...updated[0],
          ends: presetData.ends || updated[0].ends,
          panno: presetData.panno || updated[0].panno,
        };
        return updated;
      });
    }
  }, [presetData]);

  const handleSelectParty = (partyId: string) => {
    const found = parties.find((p) => p.id === partyId);
    if (found) {
      setPartyAddress(found.name);
      setPartyLocation(found.location);
      if (found.phone) setWhatsappNumber(found.phone);
      if (found.paymentDays) setPaymentDays(found.paymentDays);
    }
  };

  const dealData: DealData = {
    partyAddress,
    partyLocation,
    whatsappNumber,
    paymentDays,
    transportationOption,
    gstOption,
    beams,
  };

  useEffect(() => {
    if (onSaveDeal) {
      onSaveDeal(dealData);
    }
  }, [partyAddress, partyLocation, whatsappNumber, paymentDays, transportationOption, gstOption, beams]);

  const addBeamRow = () => {
    const newBeam: BeamQuality = {
      id: `b-${Date.now()}`,
      itemName: '21/1 SD POLY MONO',
      ends: '2400',
      panno: '48',
      beamQty: 4,
      meterPerBeam: 2000,
      rate: '295',
    };
    setBeams([...beams, newBeam]);
  };

  const removeBeamRow = (id: string) => {
    if (beams.length <= 1) return;
    setBeams(beams.filter((b) => b.id !== id));
  };

  const updateBeam = (id: string, field: keyof BeamQuality, value: any) => {
    setBeams(
      beams.map((b) => {
        if (b.id === id) {
          return { ...b, [field]: value };
        }
        return b;
      })
    );
  };

  const formattedMessage = formatDealMessage(dealData);

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWhatsApp = () => {
    openWhatsAppDirect(whatsappNumber, formattedMessage);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquareText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>Deal Message Formatter (ડીલ મેસેજ)</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Auto-formatted textile program agreement with live WhatsApp copy & dispatch
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Text'}</span>
          </button>
          <button
            type="button"
            onClick={handleSendWhatsApp}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Send to WhatsApp</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Inputs (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Party Information */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3.5 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-500" />
                <span>Party Information (પાર્ટી વિગત)</span>
              </span>
              <select
                onChange={(e) => handleSelectParty(e.target.value)}
                defaultValue=""
                className="text-xs px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 font-medium"
              >
                <option value="">-- Quick Load Party --</option>
                {parties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.location})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Party Name / Address
                </label>
                <input
                  type="text"
                  value={partyAddress}
                  onChange={(e) => setPartyAddress(e.target.value)}
                  placeholder="e.g. ADLON TEXTILE"
                  className="w-full px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Party Location
                </label>
                <input
                  type="text"
                  value={partyLocation}
                  onChange={(e) => setPartyLocation(e.target.value)}
                  placeholder="e.g. UMBHEL"
                  className="w-full px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  WhatsApp Mobile (With Country Code)
                </label>
                <input
                  type="text"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="e.g. 919876543210"
                  className="w-full px-3 py-2 text-xs font-mono text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Days Condition
                </label>
                <input
                  type="number"
                  value={paymentDays}
                  onChange={(e) => setPaymentDays(Number(e.target.value) || 0)}
                  placeholder="e.g. 20"
                  className="w-full px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-mono-numbers"
                />
              </div>
            </div>

            {/* Rate Options */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-4 items-center">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Rate Terms:</span>
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={transportationOption}
                  onChange={(e) => setTransportationOption(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500"
                />
                <span>+ Transportation</span>
              </label>
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={gstOption}
                  onChange={(e) => setGstOption(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500"
                />
                <span>+ GST</span>
              </label>
            </div>
          </div>

          {/* Quality Repeater */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-500" />
                <span>Beam / Quality Configurations ({beams.length})</span>
              </span>
              <button
                type="button"
                onClick={addBeamRow}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-2xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Quality</span>
              </button>
            </div>

            {beams.map((beam, index) => (
              <div
                key={beam.id}
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3.5 transition-colors"
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Quality / Beam Group #{index + 1}
                  </span>
                  {beams.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeBeamRow(beam.id)}
                      className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg transition-colors cursor-pointer"
                      title="Remove Group"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Item Name
                  </label>
                  <input
                    type="text"
                    value={beam.itemName}
                    onChange={(e) => updateBeam(beam.id, 'itemName', e.target.value)}
                    placeholder="e.g. 21/1 SD POLY MONO"
                    className="w-full px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Ends
                    </label>
                    <input
                      type="text"
                      value={beam.ends}
                      onChange={(e) => updateBeam(beam.id, 'ends', e.target.value)}
                      placeholder="e.g. 2400"
                      className="w-full px-2.5 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg font-mono-numbers outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Panno
                    </label>
                    <input
                      type="text"
                      value={beam.panno}
                      onChange={(e) => updateBeam(beam.id, 'panno', e.target.value)}
                      placeholder="e.g. 48"
                      className="w-full px-2.5 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg font-mono-numbers outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Beam Qty
                    </label>
                    <input
                      type="number"
                      value={beam.beamQty}
                      onChange={(e) =>
                        updateBeam(beam.id, 'beamQty', Number(e.target.value) || 0)
                      }
                      placeholder="e.g. 8"
                      className="w-full px-2.5 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg font-mono-numbers outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Mtr/Beam
                    </label>
                    <input
                      type="number"
                      value={beam.meterPerBeam}
                      onChange={(e) =>
                        updateBeam(beam.id, 'meterPerBeam', Number(e.target.value) || 0)
                      }
                      placeholder="e.g. 2000"
                      className="w-full px-2.5 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg font-mono-numbers outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="w-40">
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Rate (ભાવ / મીટર)
                    </label>
                    <input
                      type="text"
                      value={beam.rate}
                      onChange={(e) => updateBeam(beam.id, 'rate', e.target.value)}
                      placeholder="e.g. 295"
                      className="w-full px-2.5 py-1.5 text-xs font-bold text-blue-900 dark:text-blue-300 bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg outline-none"
                    />
                  </div>
                  <div className="text-right text-xs">
                    <span className="text-slate-400 block text-[11px]">Total Meter:</span>
                    <strong className="text-slate-900 dark:text-white font-mono-numbers">
                      {beam.beamQty * beam.meterPerBeam} Mtr
                    </strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Output: Realtime WhatsApp Preview (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3.5 sticky top-20 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Live WhatsApp Output Preview</span>
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold inline-flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>

            <pre className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 font-mono text-xs leading-relaxed whitespace-pre-wrap max-h-[520px] overflow-y-auto select-all shadow-inner">
              {formattedMessage}
            </pre>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleCopy}
                className="flex-1 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                {copied ? 'Copied Successfully!' : 'Copy Formatted Text'}
              </button>
              <button
                type="button"
                onClick={handleSendWhatsApp}
                className="flex-1 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Send via WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
