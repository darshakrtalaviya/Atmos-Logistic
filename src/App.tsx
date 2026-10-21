import React, { useState, useEffect, useMemo } from 'react';
import {
  TripRecord,
  PaymentRecord,
  PartyProfile,
  DealData,
  ProgramCalcInput,
  EntryType,
} from './types';
import {
  loadTrips,
  saveTrips,
  loadPayments,
  savePayments,
  loadParties,
  saveParties,
  loadDeal,
  saveDeal,
  loadCalcInput,
  saveCalcInput,
  computeProcessedTrips,
} from './utils/storage';
import {
  INITIAL_PARTIES,
  INITIAL_TRIPS,
  INITIAL_PAYMENTS,
} from './data/initialData';
import {
  getAuthSession,
  setAuthSession,
  AuthUser,
} from './utils/auth';
import { Navbar, ActiveTab } from './components/Navbar';
import { DashboardOverview } from './components/DashboardOverview';
import { ProgramCalculator } from './components/ProgramCalculator';
import { DealMessageBuilder } from './components/DealMessageBuilder';
import { TempoRegister } from './components/TempoRegister';
import { LedgerStatement } from './components/LedgerStatement';
import { DirectoryManager } from './components/DirectoryManager';
import { ChallanModal } from './components/ChallanModal';
import { CsvManagerModal } from './components/CsvManagerModal';
import { AuthScreen } from './components/AuthScreen';
import { PasswordSettingsModal } from './components/PasswordSettingsModal';
import { TripEditModal } from './components/TripEditModal';
import {
  subscribeParties,
  syncPartyToFirestore,
  deletePartyFromFirestore,
  subscribeTrips,
  syncTripToFirestore,
  deleteTripFromFirestore,
  subscribePayments,
  syncPaymentToFirestore,
} from './utils/firebaseSync';
import { testConnection } from './firebase';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');

  // Theme State: Light / Dark Mode with Persistence
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('atmos_erp_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
    localStorage.setItem('atmos_erp_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Authentication State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => getAuthSession());
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const handleLoginSuccess = (username: string) => {
    const userSession: AuthUser = {
      username,
      isLoggedIn: true,
      lastLogin: new Date().toISOString(),
    };
    setAuthSession(userSession);
    setCurrentUser(userSession);
  };

  const handleLogout = () => {
    setAuthSession(null);
    setCurrentUser(null);
    setIsPasswordModalOpen(false);
  };

  // Core App State with LocalStorage backing
  const [rawTrips, setRawTrips] = useState<TripRecord[]>(() => loadTrips());
  const [payments, setPayments] = useState<PaymentRecord[]>(() => loadPayments());
  const [parties, setParties] = useState<PartyProfile[]>(() => loadParties());
  const [dealData, setDealData] = useState<DealData>(() => loadDeal());
  const [calcInput, setCalcInput] = useState<ProgramCalcInput>(() => loadCalcInput());

  // Modal States
  const [activeChallanTrip, setActiveChallanTrip] = useState<TripRecord | null>(null);
  const [editingTrip, setEditingTrip] = useState<TripRecord | null>(null);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [tempoFormInitialType, setTempoFormInitialType] = useState<EntryType>('Inward');
  const [dealPreset, setDealPreset] = useState<{ ends?: string; panno?: string }>({});

  // Compute FIFO-adjusted trip fares and dues
  const trips = useMemo(() => {
    return computeProcessedTrips(rawTrips, payments);
  }, [rawTrips, payments]);

  // Synchronize to localStorage
  useEffect(() => {
    saveTrips(rawTrips);
  }, [rawTrips]);

  useEffect(() => {
    savePayments(payments);
  }, [payments]);

  useEffect(() => {
    saveParties(parties);
  }, [parties]);

  useEffect(() => {
    saveDeal(dealData);
  }, [dealData]);

  useEffect(() => {
    saveCalcInput(calcInput);
  }, [calcInput]);

  // Firebase Firestore Live Cloud Sync & Seed
  useEffect(() => {
    let active = true;

    // 1. Subscribe to Parties
    const unsubParties = subscribeParties((remoteParties) => {
      if (!active) return;
      if (remoteParties && remoteParties.length > 0) {
        setParties(remoteParties);
      } else {
        // Seed initial parties to Firestore if collection is empty
        INITIAL_PARTIES.forEach((p) => {
          syncPartyToFirestore(p).catch(() => {});
        });
      }
    });

    // 2. Subscribe to Trips
    const unsubTrips = subscribeTrips((remoteTrips) => {
      if (!active) return;
      if (remoteTrips && remoteTrips.length > 0) {
        setRawTrips(remoteTrips);
      } else {
        // Seed initial trips to Firestore if collection is empty
        INITIAL_TRIPS.forEach((t) => {
          syncTripToFirestore(t).catch(() => {});
        });
      }
    });

    // 3. Subscribe to Payments
    const unsubPayments = subscribePayments((remotePayments) => {
      if (!active) return;
      if (remotePayments && remotePayments.length > 0) {
        setPayments(remotePayments);
      } else {
        // Seed initial payments to Firestore if collection is empty
        INITIAL_PAYMENTS.forEach((p) => {
          syncPaymentToFirestore(p).catch(() => {});
        });
      }
    });

    return () => {
      active = false;
      unsubParties();
      unsubTrips();
      unsubPayments();
    };
  }, []);

  // Compute active party's current balance for the Challan / Receipt
  // Rule: Total Inward Pipes - (Total Outward Beams + Total Outward Pipes)
  const activePartyBalance = useMemo(() => {
    if (!activeChallanTrip) return undefined;
    const partyName = activeChallanTrip.khataName.trim().toLowerCase();
    const partyTrips = trips.filter(
      (t) => t.khataName.trim().toLowerCase() === partyName
    );
    const inPipes = partyTrips
      .filter((t) => t.entryType === 'Inward')
      .reduce((s, t) => s + (t.pipeCount || 0), 0);
    const outItems = partyTrips
      .filter((t) => t.entryType === 'Outward')
      .reduce((s, t) => s + (t.beamCount || 0) + (t.pipeCount || 0), 0);
    return inPipes - outItems;
  }, [trips, activeChallanTrip]);

  // Trip Management Actions
  const handleAddTrip = (tripData: Omit<TripRecord, 'id' | 'challanNo'>) => {
    const nextSeq = rawTrips.length + 1;
    const yearCode = new Date(tripData.date).getFullYear().toString().slice(-2);
    const challanNo = `CH-${yearCode}-${String(nextSeq).padStart(3, '0')}`;

    // Auto attach party phone if available
    const matched = parties.find(
      (p) => p.name.trim().toLowerCase() === tripData.khataName.trim().toLowerCase()
    );

    const newTrip: TripRecord = {
      ...tripData,
      id: `trip-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      challanNo,
      partyPhone: matched?.phone || '',
    };

    const updated = [...rawTrips, newTrip];
    setRawTrips(updated);
    syncTripToFirestore(newTrip).catch((err) => console.error('Firestore trip sync error:', err));

    // Promptly open the WhatsApp receipt confirmation modal!
    setActiveChallanTrip(newTrip);
  };

  const handleUpdateTrip = (updatedTrip: TripRecord) => {
    setRawTrips(rawTrips.map((t) => (t.id === updatedTrip.id ? updatedTrip : t)));
    syncTripToFirestore(updatedTrip).catch((err) => console.error('Firestore trip update error:', err));
    if (activeChallanTrip?.id === updatedTrip.id) {
      setActiveChallanTrip(updatedTrip);
    }
  };

  const handleDeleteTrip = (tripId: string) => {
    setRawTrips(rawTrips.filter((t) => t.id !== tripId));
    deleteTripFromFirestore(tripId).catch((err) => console.error('Firestore trip delete error:', err));
    if (activeChallanTrip?.id === tripId) {
      setActiveChallanTrip(null);
    }
  };

  const handleAddPayment = (paymentData: Omit<PaymentRecord, 'id'>) => {
    const newPayment: PaymentRecord = {
      ...paymentData,
      id: `pay-${Date.now()}`,
    };
    setPayments([...payments, newPayment]);
    syncPaymentToFirestore(newPayment).catch((err) => console.error('Firestore payment sync error:', err));
  };

  const handleUpdateTripPhone = (tripId: string, phone: string) => {
    const target = rawTrips.find((t) => t.id === tripId);
    if (target) {
      const updated = { ...target, partyPhone: phone };
      setRawTrips(rawTrips.map((t) => (t.id === tripId ? updated : t)));
      syncTripToFirestore(updated).catch((err) => console.error('Firestore trip phone sync error:', err));
    }
  };

  // Directory Management Actions
  const handleAddParty = (partyData: Omit<PartyProfile, 'id'>) => {
    const newParty: PartyProfile = {
      ...partyData,
      id: `party-${Date.now()}`,
    };
    setParties([...parties, newParty]);
    syncPartyToFirestore(newParty).catch((err) => console.error('Firestore party sync error:', err));
  };

  const handleUpdateParty = (updatedParty: PartyProfile) => {
    setParties(parties.map((p) => (p.id === updatedParty.id ? updatedParty : p)));
    syncPartyToFirestore(updatedParty).catch((err) => console.error('Firestore party update error:', err));
  };

  const handleDeleteParty = (id: string) => {
    setParties(parties.filter((p) => p.id !== id));
    deletePartyFromFirestore(id).catch((err) => console.error('Firestore party delete error:', err));
  };

  // Cross-module linking
  const handleExportToDeal = (params: { ends: string; panno: string }) => {
    setDealPreset(params);
    setActiveTab('deal');
  };

  const handleQuickNewChalan = (type: EntryType) => {
    setTempoFormInitialType(type);
    setActiveTab('tempo');
  };

  // CSV Import Success
  const handleCsvImportSuccess = (importedTrips: TripRecord[], importedPayments: PaymentRecord[]) => {
    setRawTrips(importedTrips);
    setPayments(importedPayments);
    setIsCsvModalOpen(false);
  };

  // If user is not logged in, show Auth Screen
  if (!currentUser?.isLoggedIn) {
    return (
      <AuthScreen
        onLoginSuccess={handleLoginSuccess}
        theme={theme}
        toggleTheme={toggleTheme}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* 3-Zone Top Navigation Contract with Dark/Light Toggle & User Profile */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewTripModal={() => {
          setTempoFormInitialType('Inward');
          setActiveTab('tempo');
        }}
        onOpenCsvModal={() => setIsCsvModalOpen(true)}
        theme={theme}
        toggleTheme={toggleTheme}
        currentUser={currentUser}
        onOpenPasswordModal={() => setIsPasswordModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Viewport Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && (
          <DashboardOverview
            trips={trips}
            parties={parties}
            setActiveTab={setActiveTab}
            onOpenChallan={(trip) => setActiveChallanTrip(trip)}
            onQuickNewChalan={handleQuickNewChalan}
            onOpenEditTrip={(trip) => setEditingTrip(trip)}
          />
        )}

        {activeTab === 'calculator' && (
          <ProgramCalculator
            initialInput={calcInput}
            onSaveInput={(inp) => setCalcInput(inp)}
            onExportToDeal={handleExportToDeal}
          />
        )}

        {activeTab === 'deal' && (
          <DealMessageBuilder
            initialDeal={dealData}
            parties={parties}
            onSaveDeal={(d) => setDealData(d)}
            presetData={dealPreset}
          />
        )}

        {activeTab === 'tempo' && (
          <TempoRegister
            trips={trips}
            payments={payments}
            parties={parties}
            formInitialType={tempoFormInitialType}
            onAddTrip={handleAddTrip}
            onUpdateTrip={handleUpdateTrip}
            onDeleteTrip={handleDeleteTrip}
            onAddPayment={handleAddPayment}
            onOpenChallan={(trip) => setActiveChallanTrip(trip)}
          />
        )}

        {activeTab === 'statement' && (
          <LedgerStatement trips={trips} parties={parties} />
        )}

        {activeTab === 'directory' && (
          <DirectoryManager
            parties={parties}
            onAddParty={handleAddParty}
            onUpdateParty={handleUpdateParty}
            onDeleteParty={handleDeleteParty}
          />
        )}
      </main>

      {/* Printable & Instant WhatsApp Confirmation Challan Modal */}
      {activeChallanTrip && (
        <ChallanModal
          trip={activeChallanTrip}
          parties={parties}
          partyBalance={activePartyBalance}
          onClose={() => setActiveChallanTrip(null)}
          onUpdateTripPhone={handleUpdateTripPhone}
          onEditTrip={(trip) => {
            setEditingTrip(trip);
            setActiveChallanTrip(null);
          }}
        />
      )}

      {/* Global Trip Edit / Update Modal */}
      {editingTrip && (
        <TripEditModal
          trip={editingTrip}
          parties={parties}
          onSave={(updated) => {
            handleUpdateTrip(updated);
            setEditingTrip(null);
            // Re-open Challan with updated values
            setActiveChallanTrip(updated);
          }}
          onDelete={(tripId) => {
            handleDeleteTrip(tripId);
            setEditingTrip(null);
          }}
          onClose={() => setEditingTrip(null)}
        />
      )}

      {/* CSV Backup & Import Modal */}
      {isCsvModalOpen && (
        <CsvManagerModal
          trips={rawTrips}
          payments={payments}
          onImportSuccess={handleCsvImportSuccess}
          onClose={() => setIsCsvModalOpen(false)}
        />
      )}

      {/* In-App Password & Security Settings Modal */}
      <PasswordSettingsModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onLogout={handleLogout}
      />

      {/* Industrial Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-4 px-4 text-center text-xs text-slate-500 dark:text-slate-400 no-print transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>ATMOS GROUP • 2026 • Mother Yarn Splitting & Mono Yarn Beams</span>
          <span className="font-mono-numbers">
            {trips.length} Total Trips • {parties.length} Registered Parties
          </span>
        </div>
      </footer>
    </div>
  );
}
