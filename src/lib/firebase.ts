import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
};

export const app = initializeApp(firebaseConfig);

// App Check — reCAPTCHA Enterprise (skip in local dev/test)
if (import.meta.env.MODE !== 'test') {
  const reCaptchaKey = import.meta.env.VITE_RECAPTCHA_ENTERPRISE_KEY as string;
  const debugToken = import.meta.env.VITE_FIREBASE_APP_CHECK_DEBUG_TOKEN as string;

  if (import.meta.env.DEV && debugToken) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = debugToken;
  }

  if (reCaptchaKey) {
    initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider(reCaptchaKey),
      isTokenAutoRefreshEnabled: true,
    });
  }
}

export const auth = getAuth(app);
export const db = getFirestore(app);

// Connect to emulators in development
if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS === 'true') {
  connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, 'localhost', 8080);
}
