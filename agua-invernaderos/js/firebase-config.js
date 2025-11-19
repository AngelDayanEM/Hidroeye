// Importar los módulos de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    getDocs, 
    deleteDoc, 
    doc, 
    updateDoc,
    onSnapshot,
    query,
    where,
    setDoc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDWQ1oKVic0n5jRHBZ_4xyx8IqxdpvHBr4",
  authDomain: "hidroeye-c182b.firebaseapp.com",
  projectId: "hidroeye-c182b",
  storageBucket: "hidroeye-c182b.firebasestorage.app",
  messagingSenderId: "16785009729",
  appId: "1:16785009729:web:4cc5e297b7f44872a8aac0"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

// Exportar todo
export { 
    app,
    db,
    auth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
    collection, 
    addDoc, 
    getDocs, 
    deleteDoc, 
    doc, 
    updateDoc, 
    onSnapshot,
    query,
    where,
    setDoc,
    getDoc
};