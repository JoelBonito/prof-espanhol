import { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions';
import { app } from './firebase';

const functions = getFunctions(app, 'us-east1');

if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS === 'true') {
  connectFunctionsEmulator(functions, 'localhost', 5001);
}

export { functions, httpsCallable };
