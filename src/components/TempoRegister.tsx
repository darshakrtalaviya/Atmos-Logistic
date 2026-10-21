import React, { useState, useMemo } from 'react';
import { TripRecord, PaymentRecord, PartyProfile, EntryType } from '../types';
import { TripEditModal } from './TripEditModal';
import {
  Truck,
  Search,
  CreditCard,
  Edit3,
  Trash2,
  Share2,
  ArrowDownLeft,
  ArrowUpRight,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

interface TempoRegisterProps {
  trips: TripRecord[];
  payments: PaymentRecord[];
  parties: PartyProfile[];
  onAddTrip: (trip: Omit<TripRecord, 'id' | 'challanNo'>) => void;
  onUpdateTrip: (trip: TripRecord) => void;
  onDeleteTrip: (tripId: string) => void;
  onAddPayment: (payment: Omit<PaymentRecord, 'id'>) => void;
  onOpenChallan: (trip: TripRecord) => void;
  formInitialType?: EntryType;
}

export const TempoRegister: React.FC<TempoRegisterProps> = ({
  trips,
  payments,
  parties,
  onAddTrip,
  onUpdateTrip,
  onDeleteTrip,
  onAddPayment,
  onOpenChallan,
  formInitialType = 'Inward',
}) => {
  // Form State
  const [editingTripId, setEditingTripId] = useState<string | null>(null);
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [entryType, setEntryType] = useState<EntryType>(formInitialType);
  const [khataName, setKhataName] = useState<string>('');
  const [vehicleNumber, setVehicleNumber] = useState<string>('');
  const [owner, setOwner] = useState<string>('');
  const [driver, setDriver] = useState<string>('');
  const [sameAsOwner, setSameAsOwner] = useState<boolean>(false);
  const [pickup, setPickup] = useState<string>('');
  const [destination, setDestination] = useState<string>('');
  const [pipeCount, setPipeCount] = useState<number>(0);
  const [beamCount, setBeamCount] = useState<number>(0);
  const [fare, setFare] = useState<number>(0);
  const [remark, setRemark] = useState<string>('');

  // Modal Edit & Delete State
  const [tripToEdit, setTripToEdit] = useState<TripRecord | null>(null);
  const [tripToDelete, setTripToDelete] = useState<TripRecord | null>(null);

  // Payment Form State
  const [paymentOwner, setPaymentOwner] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentMessage, setPaymentMessage] = useState<string | null>(null);

  // Filters
  const [ownerFilter, setOwnerFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Autocomplete collections
  const uniqueKhatas = useMemo(() => {
    const list = Array.from(new Set(trips.map((t) => t.khataName.trim()).filter(Boolean)));
    parties.forEach((p) => {
      if (!list.includes(p.name)) list.push(p.name);
    });
    return list.sort();
  }, [trips, parties]);

  const uniqueVehicles = useMemo(() => {
    return Array.from(new Set(trips.map((t) => t.vehicleNumber.trim()).filter(Boolean))).sort();
  }, [trips]);

  const uniqueOwners = useMemo(() => {
    return Array.from(new Set(trips.map((t) => t.owner.trim()).filter(Boolean))).sort();
  }, [trips]);

  // Autocomplete vehicle handler
  const handleVehicleChange = (val: string) => {
    setVehicleNumber(val);
    const matched = trips.find(
      (t) => t.vehicleNumber.trim().toLowerCase() === val.trim().toLowerCase()
    );
    if (matched) {
      if (matched.owner && !owner) setOwner(matched.owner);
      if (matched.driver && !driver) {
        setDriver(matched.driver);
        if (matched.driver === matched.owner) setSameAsOwner(true);
      }
    }
  };

  const handleKhataChange = (val: string) => {
    setKhataName(val);
    const matched = parties.find(
      (p) => p.name.trim().toLowerCase() === val.trim().toLowerCase()
    );
    if (matched) {
      if (entryType === 'Inward' && !pickup) {
        setPickup(matched.location);
        setDestination('HINDVA');
      } else if (entryType === 'Outward' && !destination) {
        setPickup('HINDVA');
        setDestination(matched.location);
      }
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!khataName || !vehicleNumber) return;

    const payload = {
      date,
      entryType,
      khataName: khataName.trim().toUpperCase(),
      vehicleNumber: vehicleNumber.trim().toUpperCase(),
      owner: owner.trim().toUpperCase() || 'SELF',
      driver: sameAsOwner
        ? owner.trim().toUpperCase()
        : driver.trim().toUpperCase() || owner.trim().toUpperCase(),
      pickup: pickup.trim(),
      destination: destination.trim(),
      pipeCount: Number(pipeCount) || 0,
      beamCount: Number(beamCount) || 0,
      fare: Number(fare) || 0,
      remark: remark.trim(),
    };

    if (editingTripId) {
      const existing = trips.find((t) => t.id === editingTripId);
      if (existing) {
        onUpdateTrip({
          ...existing,
          ...payload,
        });
      }
      resetForm();
    } else {
      onAddTrip(payload);
      resetForm();
    }
  };

  const resetForm = () => {
    setEditingTripId(null);
    setDate(new Date().toISOString().slice(0, 10));
    setEntryType(formInitialType);
    setKhataName('');
    setVehicleNumber('');
    setOwner('');
    setDriver('');
    setSameAsOwner(false);
    setPickup('');
    setDestination('');
    setPipeCount(0);
    setBeamCount(0);
    setFare(0);
    setRemark('');
  };

  const selectedOwnerTotalDue = useMemo(() => {
    if (!paymentOwner) return 0;
    return trips
      .filter((t) => (t.owner || '').trim().toLowerCase() === paymentOwner.trim().toLowerCase())
      .reduce((sum, t) => sum + (t.due || 0), 0);
  }, [trips, paymentOwner]);

  const handlePayOwner = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(paymentAmount);
    if (!paymentOwner || isNaN(amt) || amt <= 0) {
      setPaymentMessage('Please enter a valid owner and payment amount > 0.');
      return;
    }
    if (amt > selectedOwnerTotalDue) {
      setPaymentMessage(`Amount cannot exceed owner's total due (₹${selectedOwnerTotalDue}).`);
      return;
    }

    onAddPayment({
      date: paymentDate,
      owner: paymentOwner,
      amount: amt,
      remark: `Payment cleared for ${paymentOwner} on ${paymentDate}`,
    });

    setPaymentMessage(`Successfully recorded payment of ₹${amt} to ${paymentOwner}!`);
    setPaymentAmount('');
    setTimeout(() => setPaymentMessage(null), 3000);
  };

  const filteredTrips = useMemo(() => {
    return trips.filter((t) => {
      const matchOwner = !ownerFilter || t.owner.toLowerCase() === ownerFilter.toLowerCase();
      const matchType = !typeFilter || t.entryType.toLowerCase() === typeFilter.toLowerCase();
      const matchQuery =
        !searchQuery ||
        t.khataName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.driver.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.challanNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.remark.toLowerCase().includes(searchQuery.toLowerCase());
      return matchOwner && matchType && matchQuery;
    });
  }, [trips, ownerFilter, typeFilter, searchQuery]);

  const summary = useMemo(() => {
    const list = ownerFilter
      ? trips.filter((t) => t.owner.toLowerCase() === ownerFilter.toLowerCase())
      : trips;
    const totalFare = list.reduce((s, t) => s + (t.fare || 0), 0);
    const totalPaid = list.reduce((s, t) => s + (t.paid || 0), 0);
    const totalDue = list.reduce((s, t) => s + (t.due || 0), 0);
    return { totalFare, totalPaid, totalDue };
  }, [trips, ownerFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Truck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Tempo & Chalan Register (ટેમ્પો અને ચલણ રજિસ્ટર)</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Log inward pipe pickups, outward beam deliveries, WhatsApp chalans & owner FIFO payments
          </p>
        </div>
      </div>

      {/* Entry Form */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                entryType === 'Inward' ? 'bg-emerald-500' : 'bg-blue-600'
              }`}
            ></span>
            <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              {editingTripId
                ? 'Modify Trip Entry (ચલણ વિગત સુધારો)'
                : entryType === 'Inward'
                ? '📥 Receive Pipes from Party (પાર્ટી પાસેથી ખાલી પાઇપ જમા લો)'
                : '📤 Outward Dispatch (મોનો બીમ ડિલિવરી ડિસ્પેચ)'}
            </h2>
          </div>
          {editingTripId ? (
            <button
              type="button"
              onClick={resetForm}
              className="text-xs text-rose-600 dark:text-rose-400 hover:underline font-semibold inline-flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Cancel Edit</span>
            </button>
          ) : (
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              {entryType === 'Inward' ? '✓ Instant WhatsApp પાઇપ પહોંચ' : ''}
            </span>
          )}
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Date {'{DATE}'}
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg font-mono-numbers outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Type (પ્રકાર)
              </label>
              <select
                value={entryType}
                onChange={(e) => setEntryType(e.target.value as EntryType)}
                className="w-full px-2.5 py-1.5 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="Inward">Inward (આવક - પાઇપ જમા)</option>
                <option value="Outward">Outward (જાવક - બીમ ડિલિવરી)</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Khata / Party Name
              </label>
              <input
                type="text"
                required
                list="khata-options"
                value={khataName}
                onChange={(e) => handleKhataChange(e.target.value)}
                placeholder="e.g. ADLON TEXTILE"
                className="w-full px-2.5 py-1.5 text-xs font-semibold uppercase bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
              />
              <datalist id="khata-options">
                {uniqueKhatas.map((k) => (
                  <option key={k} value={k} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tempo No. {'{TEMPO NUMBER}'}
              </label>
              <input
                type="text"
                required
                list="vehicle-options"
                value={vehicleNumber}
                onChange={(e) => handleVehicleChange(e.target.value)}
                placeholder="e.g. GJ05AB1234"
                className="w-full px-2.5 py-1.5 text-xs font-semibold uppercase bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
              />
              <datalist id="vehicle-options">
                {uniqueVehicles.map((v) => (
                  <option key={v} value={v} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tempo Owner
              </label>
              <input
                type="text"
                required
                list="owner-options"
                value={owner}
                onChange={(e) => {
                  setOwner(e.target.value);
                  if (sameAsOwner) setDriver(e.target.value);
                }}
                placeholder="Owner Name"
                className="w-full px-2.5 py-1.5 text-xs font-semibold uppercase bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
              />
              <datalist id="owner-options">
                {uniqueOwners.map((o) => (
                  <option key={o} value={o} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  Received By {'{RECIEVED BY}'}
                </label>
                <label className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sameAsOwner}
                    onChange={(e) => {
                      setSameAsOwner(e.target.checked);
                      if (e.target.checked) setDriver(owner);
                    }}
                    className="rounded text-blue-600 w-3 h-3"
                  />
                  <span>Same</span>
                </label>
              </div>
              <input
                type="text"
                disabled={sameAsOwner}
                value={driver}
                onChange={(e) => setDriver(e.target.value)}
                placeholder="Driver / Receiver"
                className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg disabled:opacity-60 outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Pickup {'{PIPE PICKUP LOCATION}'}
              </label>
              <input
                type="text"
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                placeholder="Pickup Location"
                className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Destination (ડિલિવરી સ્થળ)
              </label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Destination"
                className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Pipe Qty {'{PIPE QTY}'}
              </label>
              <input
                type="number"
                min="0"
                value={pipeCount}
                onChange={(e) => setPipeCount(Number(e.target.value) || 0)}
                className="w-full px-2.5 py-1.5 text-xs font-bold bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg font-mono-numbers outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                No. of Beams (મોનો બીમ સંખ્યા)
              </label>
              <input
                type="number"
                min="0"
                value={beamCount}
                onChange={(e) => setBeamCount(Number(e.target.value) || 0)}
                className="w-full px-2.5 py-1.5 text-xs font-bold bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg font-mono-numbers outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Total Fare (કુલ ભાડું)
              </label>
              <input
                type="number"
                min="0"
                value={fare}
                onChange={(e) => setFare(Number(e.target.value) || 0)}
                className="w-full px-2.5 py-1.5 text-xs font-bold text-blue-900 dark:text-blue-300 bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg font-mono-numbers outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1 w-full">
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Remark / Extra Information
              </label>
              <input
                type="text"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder="e.g. Received empty pipes for sizing work order"
                className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg outline-none"
              />
            </div>

            <div className="flex gap-2 shrink-0">
              <button
                type="submit"
                className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow-2xs transition-colors cursor-pointer ${
                  entryType === 'Inward'
                    ? 'bg-emerald-600 hover:bg-emerald-500'
                    : 'bg-blue-600 hover:bg-blue-500'
                }`}
              >
                {editingTripId
                  ? 'Update Trip Entry'
                  : entryType === 'Inward'
                  ? '📥 Save & Open WhatsApp Receipt'
                  : '+ Add Dispatch Entry'}
              </button>
              {editingTripId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Owner Payment Settlement (FIFO) */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs transition-colors">
        <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-3.5 flex items-center gap-1.5">
          <CreditCard className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Owner Payment Settlement (FIFO હિસાબ ચુકવણી)</span>
        </h2>
        <form onSubmit={handlePayOwner} className="flex flex-wrap items-end gap-3 text-xs">
          <div className="w-48">
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              Tempo Owner
            </label>
            <select
              value={paymentOwner}
              onChange={(e) => setPaymentOwner(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium"
            >
              <option value="">-- Select Owner --</option>
              {uniqueOwners.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
          <div className="w-36">
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
              Current Due (બાકી રકમ)
            </label>
            <div className="px-2.5 py-1.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-lg text-rose-700 dark:text-rose-300 font-bold font-mono-numbers">
              ₹{selectedOwnerTotalDue.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="w-36">
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              Payment Date
            </label>
            <input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg font-mono-numbers outline-none"
            />
          </div>
          <div className="w-36">
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              Amount (ચૂકવેલ રકમ)
            </label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              placeholder="₹ Amount"
              className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg font-mono-numbers outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            Pay Amount (FIFO)
          </button>
        </form>
        {paymentMessage && (
          <p className="mt-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            {paymentMessage}
          </p>
        )}
      </div>

      {/* Filter and Summary Bar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            <div className="relative min-w-[200px] flex-1 max-w-xs">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search khata, vehicle, driver..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <select
              value={ownerFilter}
              onChange={(e) => setOwnerFilter(e.target.value)}
              className="text-xs px-2.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
            >
              <option value="">All Owners (Total Bills)</option>
              {uniqueOwners.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="text-xs px-2.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
            >
              <option value="">All Types (Inward + Outward)</option>
              <option value="Inward">Inward Only</option>
              <option value="Outward">Outward Only</option>
            </select>
          </div>

          {/* Financial Summary */}
          <div className="flex items-center gap-3 text-xs">
            <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl">
              <span className="text-slate-500 dark:text-slate-400 text-[10px] block">
                {ownerFilter ? `${ownerFilter} Bill` : 'Total Fare'}
              </span>
              <strong className="text-slate-800 dark:text-slate-100 font-bold font-mono-numbers">
                ₹{summary.totalFare.toLocaleString('en-IN')}
              </strong>
            </div>
            <div className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 rounded-xl">
              <span className="text-emerald-700 dark:text-emerald-300 text-[10px] block">
                Total Paid
              </span>
              <strong className="text-emerald-700 dark:text-emerald-300 font-bold font-mono-numbers">
                ₹{summary.totalPaid.toLocaleString('en-IN')}
              </strong>
            </div>
            <div className="px-3 py-1.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 rounded-xl">
              <span className="text-rose-700 dark:text-rose-300 text-[10px] block">
                Total Due
              </span>
              <strong className="text-rose-700 dark:text-rose-300 font-bold font-mono-numbers">
                ₹{summary.totalDue.toLocaleString('en-IN')}
              </strong>
            </div>
          </div>
        </div>

        {/* Trips Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-xs text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-bold">
                <th className="py-3 px-3">Challan / Date</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Party (Khata)</th>
                <th className="py-3 px-3">Vehicle & Owner</th>
                <th className="py-3 px-3">Route (From ➔ To)</th>
                <th className="py-3 px-3 text-center">Pipes</th>
                <th className="py-3 px-3 text-center">Beams</th>
                <th className="py-3 px-3 text-right">Fare (ભાડું)</th>
                <th className="py-3 px-3 text-right">Due (બાકી)</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-center">Party Confirmation</th>
                <th className="py-3 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTrips.map((trip) => {
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
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono-numbers">
                        {trip.date}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          isInward
                            ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/60'
                            : 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60'
                        }`}
                      >
                        {isInward ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                        <span>{trip.entryType}</span>
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-bold text-slate-900 dark:text-slate-100 block">
                        {trip.khataName}
                      </span>
                      {trip.remark && (
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate max-w-[180px]">
                          {trip.remark}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 block">
                        {trip.vehicleNumber}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                        {trip.driver || trip.owner}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                      <span>{trip.pickup || '—'}</span>
                      <span className="text-slate-400 mx-1">➔</span>
                      <span>{trip.destination || '—'}</span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                      {trip.pipeCount > 0 ? (
                        <span className="text-blue-600 dark:text-blue-400">{trip.pipeCount}</span>
                      ) : (
                        '0'
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                      {trip.beamCount > 0 ? (
                        <span className="text-purple-600 dark:text-purple-400">{trip.beamCount}</span>
                      ) : (
                        '0'
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-800 dark:text-slate-200">
                      ₹{trip.fare?.toLocaleString('en-IN') ?? 0}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold">
                      {trip.due && trip.due > 0 ? (
                        <span className="text-rose-600 dark:text-rose-400">
                          ₹{trip.due.toLocaleString('en-IN')}
                        </span>
                      ) : (
                        <span className="text-slate-400">₹0</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          trip.status === 'Paid'
                            ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                            : trip.status === 'Partial'
                            ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300'
                            : 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300'
                        }`}
                      >
                        {trip.status || 'Unpaid'}
                      </span>
                    </td>

                    {/* Party Confirmation Action */}
                    <td className="py-2.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => onOpenChallan(trip)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg shadow-2xs transition-colors cursor-pointer ${
                          isInward
                            ? 'text-emerald-900 dark:text-emerald-200 bg-emerald-100 dark:bg-emerald-950/80 hover:bg-emerald-200 dark:hover:bg-emerald-900 border border-emerald-300 dark:border-emerald-700'
                            : 'text-purple-900 dark:text-purple-200 bg-purple-100 dark:bg-purple-950/80 hover:bg-purple-200 dark:hover:bg-purple-900 border border-purple-300 dark:border-purple-700'
                        }`}
                        title="Send confirmation receipt to Party"
                      >
                        <Share2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>{isInward ? 'WhatsApp Receipt' : 'Delivery Chalan'}</span>
                      </button>
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setTripToEdit(trip)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 rounded-lg cursor-pointer transition-colors shadow-2xs"
                          title="Edit / Update Entry (વિગત સુધારો)"
                        >
                          <Edit3 className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                          <span>સુધારો (Edit)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setTripToDelete(trip)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg cursor-pointer border border-transparent hover:border-rose-200 dark:border-rose-800 transition-colors"
                          title="Delete Entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredTrips.length === 0 && (
            <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">
              No trip records found matching your filters.
            </div>
          )}
        </div>
      </div>

      {/* Trip Edit Modal */}
      {tripToEdit && (
        <TripEditModal
          trip={tripToEdit}
          parties={parties}
          onSave={(updated) => {
            onUpdateTrip(updated);
            setTripToEdit(null);
          }}
          onDelete={(tripId) => {
            onDeleteTrip(tripId);
            setTripToEdit(null);
          }}
          onClose={() => setTripToEdit(null)}
        />
      )}

      {/* Safe In-App Delete Confirmation Modal (no window.confirm) */}
      {tripToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 no-print">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  ચલણ ડિલીટ કરવું છે? (Confirm Delete)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  ચલણ નં: <strong className="text-slate-900 dark:text-white font-mono">{tripToDelete.challanNo}</strong> ({tripToDelete.khataName} - {tripToDelete.vehicleNumber})
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setTripToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl cursor-pointer"
              >
                રદ કરો (Cancel)
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteTrip(tripToDelete.id);
                  setTripToDelete(null);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>ડિલીટ કરો (Delete)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
