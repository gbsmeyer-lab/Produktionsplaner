import { initializeApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";

declare global {
  interface ImportMeta {
    env: Record<string, string | undefined>;
  }
}

let db: Firestore | undefined;

// Safe access to environment variables
// This prevents the "undefined is not an object" crash if import.meta.env is not present
const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {};

const apiKey = env.VITE_FIREBASE_API_KEY;

if (apiKey) {
    const firebaseConfig = {
      apiKey: apiKey,
      authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: env.VITE_FIREBASE_APP_ID
    };

    try {
        const app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        console.log("Firebase initialized successfully");
    } catch (e) {
        console.error("Firebase initialization failed:", e);
    }
} else {
    console.warn("VITE_FIREBASE_API_KEY is missing. Database features will be disabled.");
}

export { db };