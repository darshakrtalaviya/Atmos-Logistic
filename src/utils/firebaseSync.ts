import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { TripRecord, PaymentRecord, PartyProfile } from '../types';

/**
 * Realtime listener for Parties
 */
export function subscribeParties(
  onUpdate: (parties: PartyProfile[]) => void,
  onError?: (err: any) => void
) {
  const colPath = 'parties';
  return onSnapshot(
    collection(db, colPath),
    (snapshot) => {
      const list: PartyProfile[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as Omit<PartyProfile, 'id'>) });
      });
      onUpdate(list);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, colPath);
    }
  );
}

/**
 * Save or update party in Firestore
 */
export async function syncPartyToFirestore(party: PartyProfile): Promise<void> {
  const path = `parties/${party.id}`;
  try {
    const { id, ...data } = party;
    await setDoc(doc(db, 'parties', id), data);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

/**
 * Delete party from Firestore
 */
export async function deletePartyFromFirestore(partyId: string): Promise<void> {
  const path = `parties/${partyId}`;
  try {
    await deleteDoc(doc(db, 'parties', partyId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

/**
 * Realtime listener for Trips (Inward & Outward)
 */
export function subscribeTrips(
  onUpdate: (trips: TripRecord[]) => void,
  onError?: (err: any) => void
) {
  const colPath = 'trips';
  return onSnapshot(
    collection(db, colPath),
    (snapshot) => {
      const list: TripRecord[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as Omit<TripRecord, 'id'>) });
      });
      onUpdate(list);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, colPath);
    }
  );
}

/**
 * Save or update trip in Firestore
 */
export async function syncTripToFirestore(trip: TripRecord): Promise<void> {
  const path = `trips/${trip.id}`;
  try {
    const { id, ...data } = trip;
    await setDoc(doc(db, 'trips', id), data);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

/**
 * Delete trip from Firestore
 */
export async function deleteTripFromFirestore(tripId: string): Promise<void> {
  const path = `trips/${tripId}`;
  try {
    await deleteDoc(doc(db, 'trips', tripId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

/**
 * Realtime listener for Payments
 */
export function subscribePayments(
  onUpdate: (payments: PaymentRecord[]) => void,
  onError?: (err: any) => void
) {
  const colPath = 'payments';
  return onSnapshot(
    collection(db, colPath),
    (snapshot) => {
      const list: PaymentRecord[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as Omit<PaymentRecord, 'id'>) });
      });
      onUpdate(list);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, colPath);
    }
  );
}

/**
 * Save or update payment in Firestore
 */
export async function syncPaymentToFirestore(payment: PaymentRecord): Promise<void> {
  const path = `payments/${payment.id}`;
  try {
    const { id, ...data } = payment;
    await setDoc(doc(db, 'payments', id), data);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}
