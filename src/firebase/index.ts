// Import the functions you need from the SDKs you need
import { FirebaseApp, getApps, initializeApp } from "firebase/app";
import {
  Auth,
  browserLocalPersistence,
  getAuth,
  setPersistence,
} from "firebase/auth";
import { Firestore, getFirestore } from "firebase/firestore";
import { FirebaseStorage, getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
};

// Initialize Firebase
let firebaseApp: FirebaseApp;
let firebaseDB: Firestore;
let firebaseAuth: Auth;
let firebaseStorage: FirebaseStorage;

if (typeof window !== "undefined") {
  // Initialize only if not already initialized
  if (getApps().length === 0) {
    firebaseApp = initializeApp(firebaseConfig);
    firebaseDB = getFirestore(firebaseApp);
    firebaseAuth = getAuth(firebaseApp);
    firebaseStorage = getStorage(firebaseApp);
    setPersistence(firebaseAuth, browserLocalPersistence);
  } else {
    firebaseApp = getApps()[0];
    firebaseDB = getFirestore(firebaseApp);
    firebaseAuth = getAuth(firebaseApp);
    firebaseStorage = getStorage(firebaseApp);
  }
} else {
  // Server-side: create dummy objects
  firebaseApp = {} as FirebaseApp;
  firebaseDB = {} as Firestore;
  firebaseAuth = {} as Auth;
  firebaseStorage = {} as FirebaseStorage;
}

export { firebaseAuth, firebaseStorage };
export default firebaseDB;
