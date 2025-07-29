import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signOut, signInWithEmailAndPassword } from "firebase/auth";
import { 
    getFirestore,
    collection,
    query,
    where,
    onSnapshot,
    doc,
    setDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp,
    addDoc,
    orderBy,
    getDoc,
    getDocs
} from "firebase/firestore";
import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject
} from "firebase/storage";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCTClpvjoo4G5eNXUQcRbxucB-53siG45Q",
  authDomain: "nodeqms.firebaseapp.com",
  projectId: "nodeqms",
  storageBucket: "nodeqms.appspot.com",
  messagingSenderId: "713844377374",
  appId: "1:713844377374:web:9b05cf85ac252a2034eb0f",
  measurementId: "G-T010SW4PV5"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Export everything from this single file
export {
    db,
    auth,
    collection,
    query,
    where,
    onSnapshot,
    doc,
    setDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp,
    addDoc,
    orderBy,
    getDoc,
    getDocs,
    onAuthStateChanged,
    signOut,
    signInWithEmailAndPassword,
    // Storage exports
    storage,
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject
};
