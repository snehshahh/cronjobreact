import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc, getDoc, collection, getDocs, addDoc,setDoc } from 'firebase/firestore';

// Your Firebase configuration object
const firebaseConfig = {
    apiKey: "AIzaSyDeqQvh1DnKmEWwwIXmrr3m6lKfuOzUlsk",
    authDomain: "hikingalert-260bf.firebaseapp.com",
    projectId: "hikingalert-260bf",
    storageBucket: "hikingalert-260bf.appspot.com",
    messagingSenderId: "1082741659608",
    appId: "1:1082741659608:web:bc663a3a282380adfb44ad",
    measurementId: "G-XQVC3JXEGV"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, doc, updateDoc, getDoc, collection, getDocs, addDoc, setDoc};
