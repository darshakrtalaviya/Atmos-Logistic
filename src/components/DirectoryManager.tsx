import React, { useState } from 'react';
import { PartyProfile } from '../types';
import {
  Users,
  Building,
  Edit3,
  Trash2,
  Phone,
  MapPin,
  Clock,
} from 'lucide-react';

interface DirectoryManagerProps {
  parties: PartyProfile[];
  onAddParty: (party: Omit<PartyProfile, 'id'>) => void;
  onUpdateParty: (party: PartyProfile) => void;
  onDeleteParty: (id: string) => void;
}

export const DirectoryManager: React.FC<DirectoryManagerProps> = ({
  parties,
  onAddParty,
  onUpdateParty,
  onDeleteParty,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentDays, setPaymentDays] = useState(20);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingId) {
      const existing = parties.find((p) => p.id === editingId);
      if (existing) {
        onUpdateParty({
          ...existing,
          name: name.trim().toUpperCase(),
          location: location.trim().toUpperCase(),
          phone: phone.trim().replace(/[^0-9]/g, ''),
          paymentDays: Number(paymentDays) || 20,
        });
      }
      resetForm();
    } else {
      onAddParty({
        name: name.trim().toUpperCase(),
        location: location.trim().toUpperCase(),
        phone: phone.trim().replace(/[^0-9]/g, ''),
        paymentDays: Number(paymentDays) || 20,
      });
      resetForm();
    }
  };

  const startEdit = (p: PartyProfile) => {
    setEditingId(p.id);
    setName(p.name);
    setLocation(p.location);
    setPhone(p.phone);
    setPaymentDays(p.paymentDays);
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setLocation('');
    setPhone('');
    setPaymentDays(20);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Party & Directory Management (પાર્ટી અને ડિરેક્ટરી)</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Store party locations, WhatsApp numbers for automated pickup chalans, and payment credit terms
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form (4 Cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs h-fit transition-colors">
          <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <Building className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>{editingId ? 'Edit Party Profile' : 'Add New Party (નવી પાર્ટી ઉમેરો)'}</span>
          </h2>

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Party / Mill Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. ADLON TEXTILE"
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl font-semibold uppercase outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Factory Location / Area
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. UMBHEL, PIPODARA"
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl uppercase outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                WhatsApp Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 919925579533"
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl font-mono outline-none focus:ring-1 focus:ring-blue-500"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Required for 1-click Chalan WhatsApp notification
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Default Credit Days (બાકી પેમેન્ટ દિવસ)
              </label>
              <input
                type="number"
                value={paymentDays}
                onChange={(e) => setPaymentDays(Number(e.target.value) || 0)}
                placeholder="e.g. 20"
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl font-mono-numbers outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-2.5 font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-2xs transition-colors cursor-pointer"
              >
                {editingId ? 'Update Party' : '+ Add Party'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-3.5 py-2.5 font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Right List (8 Cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs transition-colors">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Registered Parties Directory ({parties.length})
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {parties.map((party) => (
              <div
                key={party.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800/80 hover:border-blue-200 dark:hover:border-blue-900 transition-all space-y-2 text-xs"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <strong className="text-sm font-bold text-slate-900 dark:text-white block">
                      {party.name}
                    </strong>
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{party.location || 'Surat'}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => startEdit(party)}
                      className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg cursor-pointer"
                      title="Edit Party"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onDeleteParty(party.id);
                      }}
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg cursor-pointer"
                      title="Delete Party"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-mono font-medium">
                    <Phone className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span>+{party.phone || 'No phone set'}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{party.paymentDays} Days Net</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {parties.length === 0 && (
            <div className="p-8 text-center text-xs text-slate-400">No parties added yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};
