import { initializeApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";

declare global {
  interface ImportMeta {
    env: Record<string, string | undefined>;
  }
}

// IMPORTANT: We access import.meta.env.VITE_... directly.
// Vite statically replaces these strings during the build process.

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;

let db: Firestore | undefined;

if (apiKey) {
    const firebaseConfig = {
      apiKey: apiKey,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID
    };

    try {
        const app = initializeApp(firebaseConfig);
        db = getFirestore(app);
    } catch (e) {
        console.error("Firebase initialization failed:", e);
    }
} else {
    console.warn("VITE_FIREBASE_API_KEY is missing. Database features will be disabled.");
}

export { db };