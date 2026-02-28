import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

let cachedUid: string | null = null;
let cachedData: Record<string, unknown> | null = null;

export async function getCachedUserDoc(): Promise<Record<string, unknown>> {
  const uid = auth.currentUser?.uid;
  if (!uid) return {};

  if (cachedUid === uid && cachedData !== null) return cachedData;

  try {
    const snap = await getDoc(doc(db, 'users', uid));
    cachedUid = uid;
    cachedData = snap.data() ?? {};
    return cachedData;
  } catch (error) {
    console.warn('Failed to fetch user doc (might be offline):', error);
    // Return empty object or previous cache if available
    return cachedData ?? {};
  }
}

export function invalidateUserDocCache(): void {
  cachedData = null;
  cachedUid = null;
}
