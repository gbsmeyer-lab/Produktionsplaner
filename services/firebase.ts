import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Fix for TS errors regarding "vite/client" types not being found
declare global {
  interface ImportMeta {
    env: Record<string, string | undefined>;
  }
}

// IMPORTANT: We access import.meta.env.VITE_... directly.
// Vite statically replaces these strings during the build process.
// Assigning import.meta.env to a variable (const env = ...) breaks this replacement mechanism in production builds.

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
// If config is missing (e.g. env vars not set), this might warn, but prevents crash on import
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);