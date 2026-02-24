import { collection, deleteDoc, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface PushSubscriptionKeys {
  p256dh: string;
  auth: string;
}

export interface PushEnableResult {
  ok: boolean;
  reason?: 'unsupported' | 'denied' | 'missing_vapid' | 'unauthenticated' | 'error';
}

const PUSH_SW_PATH = '/push-sw.js';

function toUint8Array(base64Url: string): Uint8Array {
  const padded = base64Url.padEnd(base64Url.length + ((4 - (base64Url.length % 4)) % 4), '=');
  const base64 = padded.replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  const output = new Uint8Array(raw.length);
  for (let index = 0; index < raw.length; index += 1) {
    output[index] = raw.charCodeAt(index);
  }
  return output;
}

function hashEndpoint(endpoint: string): string {
  let hash = 0;
  for (let index = 0; index < endpoint.length; index += 1) {
    hash = (hash << 5) - hash + endpoint.charCodeAt(index);
    hash |= 0;
  }
  return `sub_${Math.abs(hash)}`;
}

function getPushKeys(subscription: PushSubscription): PushSubscriptionKeys {
  const p256dh = subscription.getKey('p256dh');
  const auth = subscription.getKey('auth');

  return {
    p256dh: p256dh ? window.btoa(String.fromCharCode(...new Uint8Array(p256dh))) : '',
    auth: auth ? window.btoa(String.fromCharCode(...new Uint8Array(auth))) : '',
  };
}

export function isPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'Notification' in window &&
    'PushManager' in window
  );
}

export function getPushPermission(): NotificationPermission | 'unsupported' {
  if (!isPushSupported()) return 'unsupported';
  return Notification.permission;
}

async function saveSubscription(uid: string, subscription: PushSubscription): Promise<void> {
  const endpointHash = hashEndpoint(subscription.endpoint);
  const subRef = doc(collection(db, 'users', uid, 'pushSubscriptions'), endpointHash);
  const keys = getPushKeys(subscription);

  await setDoc(
    subRef,
    {
      endpoint: subscription.endpoint,
      keys,
      userAgent: navigator.userAgent,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function unregisterPushSubscription(uid: string): Promise<void> {
  if (!isPushSupported()) return;

  const registration = await navigator.serviceWorker.getRegistration(PUSH_SW_PATH);
  const subscription = await registration?.pushManager.getSubscription();
  if (!subscription) return;

  const endpointHash = hashEndpoint(subscription.endpoint);
  await deleteDoc(doc(db, 'users', uid, 'pushSubscriptions', endpointHash));
  await subscription.unsubscribe();
}

export async function ensurePushSubscription(uid: string): Promise<PushEnableResult> {
  if (!uid) return { ok: false, reason: 'unauthenticated' };
  if (!isPushSupported()) return { ok: false, reason: 'unsupported' };

  const vapidPublicKey = import.meta.env.VITE_WEB_PUSH_PUBLIC_KEY as string | undefined;
  if (!vapidPublicKey) return { ok: false, reason: 'missing_vapid' };

  const registration = await navigator.serviceWorker.register(PUSH_SW_PATH);

  let permission = Notification.permission;
  if (permission === 'default') {
    permission = await Notification.requestPermission();
  }
  if (permission !== 'granted') {
    return { ok: false, reason: 'denied' };
  }

  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: toUint8Array(vapidPublicKey) as unknown as BufferSource,
    });
  }

  try {
    await saveSubscription(uid, subscription);
    return { ok: true };
  } catch (error) {
    console.error('Failed to save push subscription:', error);
    return { ok: false, reason: 'error' };
  }
}
