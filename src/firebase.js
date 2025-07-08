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
    getDoc
} from "firebase/firestore";

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
    onAuthStateChanged,
    signOut,
    signInWithEmailAndPassword
};
