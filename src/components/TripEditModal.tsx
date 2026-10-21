import React, { useState, useEffect } from 'react';
import { TripRecord, PartyProfile, EntryType } from '../types';
import {
  X,
  Edit3,
  Trash2,
  Save,
  ArrowDownLeft,
  ArrowUpRight,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

interface TripEditModalProps {
  trip: TripRecord | null;
  parties: PartyProfile[];
  onSave: (updatedTrip: TripRecord) => void;
  onDelete: (tripId: string) => void;
  onClose: () => void;
}

export const TripEditModal: React.FC<TripEditModalProps> = ({
  trip,
  parties,
  onSave,
  onDelete,
  onClose,
}) => {
  if (!trip) return null;

  const [date, setDate] = useState(trip.date || '');
  const [entryType, setEntryType] = useState<EntryType>(trip.entryType || 'Inward');
  const [khataName, setKhataName] = useState(trip.khataName || '');
  const [partyPhone, setPartyPhone] = useState(trip.partyPhone || '');
  const [vehicleNumber, setVehicleNumber] = useState(trip.vehicleNumber || '');
  const [owner, setOwner] = useState(trip.owner || '');
  const [driver, setDriver] = useState(trip.driver || '');
  const [driverPhone, setDriverPhone] = useState(trip.driverPhone || '');
  const [sameAsOwner, setSameAsOwner] = useState(trip.driver === trip.owner);
  const [pickup, setPickup] = useState(trip.pickup || '');
  const [destination, setDestination] = useState(trip.destination || '');
  const [pipeCount, setPipeCount] = useState<number>(trip.pipeCount || 0);
  const [beamCount, setBeamCount] = useState<number>(trip.beamCount || 0);
  const [fare, setFare] = useState<number>(trip.fare || 0);
  const [remark, setRemark] = useState(trip.remark || '');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync if trip changes
  useEffect(() => {
    if (trip) {
      setDate(trip.date || '');
      setEntryType(trip.entryType || 'Inward');
      setKhataName(trip.khataName || '');
      setPartyPhone(trip.partyPhone || '');
      setVehicleNumber(trip.vehicleNumber || '');
      setOwner(trip.owner || '');
      setDriver(trip.driver || '');
      setDriverPhone(trip.driverPhone || '');
      setSameAsOwner(trip.driver === trip.owner);
      setPickup(trip.pickup || '');
      setDestination(trip.destination || '');
      setPipeCount(trip.pipeCount || 0);
      setBeamCount(trip.beamCount || 0);
      setFare(trip.fare || 0);
      setRemark(trip.remark || '');
      setIsConfirmingDelete(false);
      setSavedSuccess(false);
    }
  }, [trip]);

  const handleKhataSelect = (name: string) => {
    setKhataName(name);
    const matched = parties.find((p) => p.name.toLowerCase() === name.toLowerCase());
    if (matched) {
      if (!partyPhone && matched.phone) setPartyPhone(matched.phone);
      if (entryType === 'Inward' && !pickup) {
        setPickup(matched.location);
        setDestination('HINDVA');
      } else if (entryType === 'Outward' && !destination) {
        setPickup('HINDVA');
        setDestination(matched.location);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!khataName || !vehicleNumber) return;

    const updated: TripRecord = {
      ...trip,
      date,
      entryType,
      khataName: khataName.trim().toUpperCase(),
      partyPhone: partyPhone.trim(),
      vehicleNumber: vehicleNumber.trim().toUpperCase(),
      owner: owner.trim().toUpperCase() || 'SELF',
      driver: sameAsOwner
        ? owner.trim().toUpperCase()
        : driver.trim().toUpperCase() || owner.trim().toUpperCase(),
      driverPhone: driverPhone.trim(),
      pickup: pickup.trim(),
      destination: destination.trim(),
      pipeCount: Number(pipeCount) || 0,
      beamCount: Number(beamCount) || 0,
      fare: Number(fare) || 0,
      remark: remark.trim(),
    };

    onSave(updated);
    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const handleDeleteConfirm = () => {
    onDelete(trip.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 no-print">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 dark:bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-base tracking-tight text-white">
                  Edit & Update Entry (ચલણ વિગત સુધારો)
                </h2>
                <span className="px-2 py-0.5 text-xs font-mono font-bold bg-slate-800 border border-slate-700 rounded-md text-blue-400">
                  {trip.challanNo}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Update tempo pickup, outward delivery, pipe qty, vehicle, and party details
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Delete Confirmation Warning Box */}
        {isConfirmingDelete ? (
          <div className="p-6 bg-rose-50 dark:bg-rose-950/50 border-b border-rose-200 dark:border-rose-800/80 space-y-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-sm text-rose-900 dark:text-rose-200">
                  શું તમે આ ચલણ ખરેખર ડિલીટ કરવા માંગો છો?
                </h3>
                <p className="text-xs text-rose-700 dark:text-rose-300 mt-1">
                  ચલણ નં: <strong>{trip.challanNo}</strong> ({trip.khataName} - {trip.vehicleNumber})
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl cursor-pointer"
              >
                રદ કરો (Cancel)
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-md transition-all active:scale-98 cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>હા, ડિલીટ કરો (Yes, Delete)</span>
              </button>
            </div>
          </div>
        ) : null}

        {savedSuccess && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>ચલણ સફળતાપૂર્વક સુધારાઈ ગયું (Entry updated successfully)!</span>
          </div>
        )}

        {/* Main Edit Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Row 1: Entry Type & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Entry Type (પ્રકાર)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setEntryType('Inward')}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                    entryType === 'Inward'
                      ? 'bg-sky-50 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-700 shadow-2xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <ArrowDownLeft className="w-3.5 h-3.5" />
                  <span>Inward (આવક)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEntryType('Outward')}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                    entryType === 'Outward'
                      ? 'bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700 shadow-2xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>Outward (જાવક)</span>
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Entry Date (તારીખ)
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
          </div>

          {/* Row 2: Khata Name & Party Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Khata / Party Name (ખાતાનું નામ)
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  list="edit-parties-list"
                  value={khataName}
                  onChange={(e) => handleKhataSelect(e.target.value)}
                  placeholder="e.g. ADLON TEXTILE"
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold uppercase"
                />
                <datalist id="edit-parties-list">
                  {parties.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.location}
                    </option>
                  ))}
                </datalist>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Party WhatsApp Mobile (પાર્ટી નંબર)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400 text-xs">+</span>
                <input
                  type="text"
                  value={partyPhone}
                  onChange={(e) => setPartyPhone(e.target.value)}
                  placeholder="919925579533"
                  className="w-full pl-6 pr-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Row 3: Vehicle, Owner, Driver */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Vehicle No. (વાહન નંબર)
              </label>
              <input
                type="text"
                required
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                placeholder="GJ-05-XX-1234"
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Owner (માલિક)
              </label>
              <input
                type="text"
                value={owner}
                onChange={(e) => setOwner(e.target.value.toUpperCase())}
                placeholder="Owner name"
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 uppercase"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Driver (ડ્રાઈવર)
                </label>
                <label className="text-[10px] text-blue-600 dark:text-blue-400 flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sameAsOwner}
                    onChange={(e) => {
                      setSameAsOwner(e.target.checked);
                      if (e.target.checked) setDriver(owner);
                    }}
                    className="rounded"
                  />
                  <span>Same</span>
                </label>
              </div>
              <input
                type="text"
                value={sameAsOwner ? owner : driver}
                disabled={sameAsOwner}
                onChange={(e) => setDriver(e.target.value.toUpperCase())}
                placeholder="Driver name"
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 uppercase disabled:opacity-60"
              />
            </div>
          </div>

          {/* Row 4: Pickup & Destination */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Pickup Location (માલ ઉપાડવાનું સ્થળ)
              </label>
              <input
                type="text"
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                placeholder="e.g. UMBHEL or Godown"
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Destination (પહોંચાડવાનું સ્થળ)
              </label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. HINDVA"
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Row 5: Quantities (Pipes, Beams, Fare) */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Pipe Count (પાઇપ સંખ્યા)
              </label>
              <input
                type="number"
                min="0"
                value={pipeCount}
                onChange={(e) => setPipeCount(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-blue-600 dark:text-blue-400 font-bold font-mono rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Beam Count (મોનો બીમ)
              </label>
              <input
                type="number"
                min="0"
                value={beamCount}
                onChange={(e) => setBeamCount(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-purple-600 dark:text-purple-400 font-bold font-mono rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Fare (ભાડું ₹)
              </label>
              <input
                type="number"
                min="0"
                value={fare}
                onChange={(e) => setFare(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold font-mono rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Row 6: Remark */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Remark / નોંધ
            </label>
            <input
              type="text"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="e.g. 15 pipes received for mono warping"
              className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Action Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsConfirmingDelete(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl border border-rose-200 dark:border-rose-900/40 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Entry (ડિલીટ)</span>
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-98 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save & Update Entry (સુધારો સાચવો)</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
