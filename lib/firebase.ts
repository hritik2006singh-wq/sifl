import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
export const firebaseConfig = {
  apiKey: "AIzaSyCRzHWUfUiR9DgmikNcnRjYlYh3jzN4fZk",
  authDomain: "sifl-lms.firebaseapp.com",
  projectId: "sifl-lms",
  storageBucket: "sifl-lms.firebasestorage.app",
  messagingSenderId: "680100271021",
  appId: "1:680100271021:web:681b222546b2528dcac724",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);