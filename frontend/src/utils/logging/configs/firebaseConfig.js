import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp, doc, updateDoc, getDocs, query, where } from "firebase/firestore";

// Your Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyCH9BnhEec0Di2tiPu5mSCNirLxhmZ1iPE",
    authDomain: "ui-interactions-dataset.firebaseapp.com",
    projectId: "ui-interactions-dataset",
    storageBucket: "ui-interactions-dataset.firebasestorage.app",
    messagingSenderId: "318840874498",
    appId: "1:318840874498:web:30e37b07489aa75f5f291b",
    measurementId: "G-041EN5Z2WZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, collection, addDoc, serverTimestamp, doc, updateDoc, getDocs, query, where };
