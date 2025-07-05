import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

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
export const auth = getAuth(app);
export const db = getFirestore(app);
