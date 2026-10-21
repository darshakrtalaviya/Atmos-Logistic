import { TripRecord, PaymentRecord, PartyProfile, DealData, ProgramCalcInput } from '../types';
import {
  INITIAL_PARTIES,
  INITIAL_TRIPS,
  INITIAL_PAYMENTS,
  INITIAL_DEAL,
  INITIAL_CALC_INPUT,
} from '../data/initialData';

const KEYS = {
  TRIPS: 'atmos_erp_trips_v2',
  PAYMENTS: 'atmos_erp_payments_v2',
  PARTIES: 'atmos_erp_parties_v2',
  DEAL: 'atmos_erp_deal_v2',
  CALC: 'atmos_erp_calc_v2',
};

export function loadTrips(): TripRecord[] {
  try {
    const raw = localStorage.getItem(KEYS.TRIPS);
    if (!raw) {
      localStorage.setItem(KEYS.TRIPS, JSON.stringify(INITIAL_TRIPS));
      return INITIAL_TRIPS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_TRIPS;
  }
}

export function saveTrips(trips: TripRecord[]): void {
  localStorage.setItem(KEYS.TRIPS, JSON.stringify(trips));
}

export function loadPayments(): PaymentRecord[] {
  try {
    const raw = localStorage.getItem(KEYS.PAYMENTS);
    if (!raw) {
      localStorage.setItem(KEYS.PAYMENTS, JSON.stringify(INITIAL_PAYMENTS));
      return INITIAL_PAYMENTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_PAYMENTS;
  }
}

export function savePayments(payments: PaymentRecord[]): void {
  localStorage.setItem(KEYS.PAYMENTS, JSON.stringify(payments));
}

export function loadParties(): PartyProfile[] {
  try {
    const raw = localStorage.getItem(KEYS.PARTIES);
    if (!raw) {
      localStorage.setItem(KEYS.PARTIES, JSON.stringify(INITIAL_PARTIES));
      return INITIAL_PARTIES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_PARTIES;
  }
}

export function saveParties(parties: PartyProfile[]): void {
  localStorage.setItem(KEYS.PARTIES, JSON.stringify(parties));
}

export function loadDeal(): DealData {
  try {
    const raw = localStorage.getItem(KEYS.DEAL);
    if (!raw) {
      localStorage.setItem(KEYS.DEAL, JSON.stringify(INITIAL_DEAL));
      return INITIAL_DEAL;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_DEAL;
  }
}

export function saveDeal(deal: DealData): void {
  localStorage.setItem(KEYS.DEAL, JSON.stringify(deal));
}

export function loadCalcInput(): ProgramCalcInput {
  try {
    const raw = localStorage.getItem(KEYS.CALC);
    if (!raw) {
      localStorage.setItem(KEYS.CALC, JSON.stringify(INITIAL_CALC_INPUT));
      return INITIAL_CALC_INPUT;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_CALC_INPUT;
  }
}

export function saveCalcInput(input: ProgramCalcInput): void {
  localStorage.setItem(KEYS.CALC, JSON.stringify(input));
}

/**
 * Computes FIFO payment settlement per owner across trips
 */
export function computeProcessedTrips(trips: TripRecord[], payments: PaymentRecord[]): TripRecord[] {
  const processed: TripRecord[] = trips.map((trip) => ({
    ...trip,
    fare: Number(trip.fare) || 0,
    paid: 0,
    due: Number(trip.fare) || 0,
    status: 'Unpaid' as const,
  }));

  const ownerMap: Record<string, TripRecord[]> = {};
  processed.forEach((r) => {
    const o = (r.owner || '').trim().toLowerCase();
    if (!ownerMap[o]) ownerMap[o] = [];
    ownerMap[o].push(r);
  });

  Object.keys(ownerMap).forEach((ownerKey) => {
    ownerMap[ownerKey].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const ownerPayments = payments.filter(
      (p) => (p.owner || '').trim().toLowerCase() === ownerKey
    );
    let paymentPool = ownerPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    for (const rec of ownerMap[ownerKey]) {
      const fare = rec.fare || 0;
      if (fare === 0) {
        rec.paid = 0;
        rec.due = 0;
        rec.status = 'Paid';
        continue;
      }
      if (paymentPool <= 0) {
        rec.paid = 0;
        rec.due = fare;
        rec.status = 'Unpaid';
      } else if (paymentPool >= fare) {
        rec.paid = fare;
        rec.due = 0;
        rec.status = 'Paid';
        paymentPool -= fare;
      } else {
        rec.paid = paymentPool;
        rec.due = fare - paymentPool;
        rec.status = 'Partial';
        paymentPool = 0;
      }
    }
  });

  return processed;
}

/**
 * Generates CSV string matching user's TEMPO_REGISTER.csv format
 */
export function generateCSVContent(trips: TripRecord[], payments: PaymentRecord[]): string {
  const headers = [
    'Record Type',
    'Date',
    'Type',
    'Khata Name',
    'Vehicle No.',
    'Owner',
    'Driver',
    'Pickup',
    'Destination',
    'Pipes',
    'Beams',
    'Fare',
    'Payment Amount',
    'Remark',
  ];

  const rows: string[] = [headers.map((c) => `"${c}"`).join(',')];

  trips.forEach((r) => {
    const cells = [
      'Trip',
      r.date,
      r.entryType,
      r.khataName,
      r.vehicleNumber,
      r.owner,
      r.driver,
      r.pickup,
      r.destination,
      String(r.pipeCount || 0),
      String(r.beamCount || 0),
      String(r.fare || 0),
      '',
      r.remark || '',
    ];
    rows.push(cells.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','));
  });

  payments.forEach((p) => {
    const cells = [
      'Payment',
      p.date,
      '',
      '',
      '',
      p.owner,
      '',
      '',
      '',
      '',
      '',
      '',
      String(p.amount || 0),
      p.remark || '',
    ];
    rows.push(cells.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','));
  });

  return '\uFEFF' + rows.join('\r\n') + '\r\n';
}

/**
 * Parse CSV format
 */
export function parseCSVContent(text: string): { trips: TripRecord[]; payments: PaymentRecord[] } {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = '';
  let inQuotes = false;
  const cleanText = text.replace(/^\uFEFF/, '');

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    if (char === '"') {
      if (inQuotes && cleanText[i + 1] === '"') {
        value += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(value);
      value = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && cleanText[i + 1] === '\n') i++;
      row.push(value);
      if (row.some((c) => c.trim() !== '')) rows.push(row);
      row = [];
      value = '';
    } else {
      value += char;
    }
  }
  row.push(value);
  if (row.some((c) => c.trim() !== '')) rows.push(row);

  if (rows.length === 0) return { trips: [], payments: [] };

  const normalize = (v: string) => v.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  const headers = rows[0].map(normalize);

  const parsedTrips: TripRecord[] = [];
  const parsedPayments: PaymentRecord[] = [];

  const getCell = (r: string[], ...names: string[]) => {
    const idx = headers.findIndex((h) => names.includes(h));
    return idx < 0 ? '' : (r[idx] || '').trim();
  };

  rows.slice(1).forEach((r, idx) => {
    const date = getCell(r, 'date') || new Date().toISOString().slice(0, 10);
    const kind = getCell(r, 'recordtype', 'kind').toLowerCase();
    const owner = getCell(r, 'owner', 'tempoowner');
    const paymentAmount = getCell(r, 'paymentamount', 'clearamount');

    if (kind === 'payment' || (owner && Number(paymentAmount) > 0 && !getCell(r, 'vehicleno', 'vehicle'))) {
      if (owner && Number(paymentAmount) > 0) {
        parsedPayments.push({
          id: `csv-pay-${Date.now()}-${idx}`,
          date,
          owner,
          amount: Number(paymentAmount),
          remark: getCell(r, 'remark', 'remarks'),
        });
      }
      return;
    }

    const vehicleNumber = getCell(r, 'vehicleno', 'vehiclenumber', 'vehicle');
    const fare = Number(getCell(r, 'fare')) || 0;
    const khataName = getCell(r, 'khataname', 'khata');

    if (vehicleNumber || khataName) {
      parsedTrips.push({
        id: `csv-trip-${Date.now()}-${idx}`,
        challanNo: `CH-${date.slice(2, 4)}-${String(idx + 1).padStart(3, '0')}`,
        date,
        entryType: getCell(r, 'type', 'entrytype').toLowerCase().includes('out') ? 'Outward' : 'Inward',
        khataName: khataName || 'General',
        vehicleNumber: vehicleNumber || 'TEMPO',
        owner: owner || 'Self',
        driver: getCell(r, 'driver', 'drivername') || owner || 'Driver',
        pickup: getCell(r, 'pickup', 'pick up') || '',
        destination: getCell(r, 'destination') || '',
        pipeCount: Number(getCell(r, 'pipes', 'noofpipe', 'pipecount')) || 0,
        beamCount: Number(getCell(r, 'beams', 'noofbeam', 'beamcount')) || 0,
        fare,
        remark: getCell(r, 'remark', 'remarks') || '',
      });
    }
  });

  return { trips: parsedTrips, payments: parsedPayments };
}
