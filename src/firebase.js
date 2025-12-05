// src/firebase.js
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB3nZS_QJKyebC5gklkKJ6Lp1aROBfcgHM",
  authDomain: "ecoshare-7b63a.firebaseapp.com",
  projectId: "ecoshare-7b63a",
  storageBucket: "ecoshare-7b63a.appspot.com",
  messagingSenderId: "228155502342",
  appId: "1:228155502342:web:82a25239ddb20aac6ab887"
  };

const app = initializeApp(firebaseConfig);

const storage = getStorage(app);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, storage, db, auth };

