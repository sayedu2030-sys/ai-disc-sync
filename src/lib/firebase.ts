import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  getDocs,
  collection,
  onSnapshot,
  writeBatch,
  getDocFromServer,
  getCountFromServer
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Participant } from '../types';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with specific databaseId if provided
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Test connection on boot as requested by Firebase integration guidelines
export async function testFirebaseConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('[Firebase] Firestore connected successfully');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('[Firebase] Client is offline or waiting for network');
      return false;
    }
    // Non-fatal if document doesn't exist yet
    return true;
  }
}

// Subscribe to real-time participant changes in Firestore
export function subscribeParticipants(
  onData: (participants: Participant[]) => void,
  onError?: (err: Error) => void
): () => void {
  const participantsRef = collection(db, 'participants');

  const unsubscribe = onSnapshot(
    participantsRef,
    (snapshot) => {
      const items: Participant[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as Participant;
        items.push({
          ...data,
          id: docSnap.id
        });
      });

      // Sort by submittedAt descending (newest first) or id
      items.sort((a, b) => {
        if (a.submittedAt && b.submittedAt) {
          return b.submittedAt.localeCompare(a.submittedAt);
        }
        return (b.id || '').localeCompare(a.id || '');
      });

      onData(items);
    },
    (err) => {
      console.error('[Firebase] Error listening to participants:', err);
      if (onError) onError(err);
    }
  );

  return unsubscribe;
}

// Save or update participant result in Firestore
export async function saveParticipantToFirestore(participant: Participant): Promise<void> {
  const docRef = doc(db, 'participants', participant.id);
  await setDoc(docRef, participant, { merge: true });
}

// Lightweight count fetch (costs only 1 read, no document downloads)
export async function getParticipantCount(): Promise<number> {
  try {
    const participantsRef = collection(db, 'participants');
    const snapshot = await getCountFromServer(participantsRef);
    return snapshot.data().count;
  } catch (err) {
    console.warn('[Firebase] Failed to fetch participant count:', err);
    return 0;
  }
}

// Clear all participant data in Firestore (Admin Reset)
export async function resetAllParticipantsInFirestore(): Promise<number> {
  try {
    const participantsRef = collection(db, 'participants');
    const snapshot = await getDocs(participantsRef);

    if (snapshot.empty) {
      console.log('[Firebase] No participants found to reset.');
      return 0;
    }

    const docs = snapshot.docs;
    const chunkSize = 400;
    let count = 0;

    for (let i = 0; i < docs.length; i += chunkSize) {
      const chunk = docs.slice(i, i + chunkSize);
      const batch = writeBatch(db);
      chunk.forEach((docSnap) => {
        batch.delete(docSnap.ref);
      });
      await batch.commit();
      count += chunk.length;
    }

    console.log(`[Firebase] Successfully deleted ${count} participants from Firestore.`);
    return count;
  } catch (err) {
    console.error('[Firebase] Failed to reset participants in Firestore:', err);
    throw err;
  }
}
