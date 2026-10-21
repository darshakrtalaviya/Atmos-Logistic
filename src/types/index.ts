export type EntryType = 'Inward' | 'Outward';

export interface TripRecord {
  id: string;
  challanNo: string;
  date: string;
  entryType: EntryType;
  khataName: string;
  partyPhone?: string;
  vehicleNumber: string;
  owner: string;
  driver: string;
  driverPhone?: string;
  pickup: string;
  destination: string;
  pipeCount: number;
  beamCount: number;
  fare: number;
  remark: string;
  // Computed values
  paid?: number;
  due?: number;
  status?: 'Paid' | 'Partial' | 'Unpaid';
}

export interface PaymentRecord {
  id: string;
  date: string;
  owner: string;
  amount: number;
  remark?: string;
}

export interface PartyProfile {
  id: string;
  name: string;
  location: string;
  phone: string;
  paymentDays: number;
}

export interface BeamQuality {
  id: string;
  itemName: string;
  ends: string;
  panno: string;
  beamQty: number;
  meterPerBeam: number;
  rate: string;
}

export interface DealData {
  partyAddress: string;
  partyLocation: string;
  whatsappNumber: string;
  paymentDays: number;
  transportationOption: boolean;
  gstOption: boolean;
  beams: BeamQuality[];
}

export interface ProgramCalcInput {
  yarnDenier: number;
  filament: number;
  creel: number;
  ends: number;
  pano: number;
  reedDividers: (number | 'auto')[];
  manualReedActive: boolean;
  manualReedSize: number;
}

export interface ProgramCalcOutput {
  section: number;
  gola: number;
  reedCount: number;
  requiredReed: number;
  reedGharBeam: number;
  reedGharSection: number;
  avgEndsGhar: number;
  dividerResults: {
    divider: number;
    reedCount: number;
    requiredReed: number;
  }[];
  pattern: number[];
  baseEnds: number;
  extraEnds: number;
  ruleExplanation: string;
  highTar?: number;
  lowTar?: number;
  highCount?: number;
  lowCount?: number;
}
