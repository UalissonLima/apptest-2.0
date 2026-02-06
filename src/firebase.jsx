// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBkAWlNuiTrPXiVguLY-hMBMn_5u5dhyxQ",
    authDomain: "meu-estudei-f7064.firebaseapp.com",
    databaseURL: "https://meu-estudei-f7064-default-rtdb.firebaseio.com",
    projectId: "meu-estudei-f7064",
    storageBucket: "meu-estudei-f7064.firebasestorage.app",
    messagingSenderId: "551684003126",
    appId: "1:551684003126:web:c6a7fb64c653ee16b70f97",
    measurementId: "G-G2KK92YV6N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
