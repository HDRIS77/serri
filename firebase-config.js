// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBgq7rTn4F38WytD2TXNzWV_mM-qOsrHDs",
  authDomain: "serri-6378e.firebaseapp.com",
  projectId: "serri-6378e",
  storageBucket: "serri-6378e.firebasestorage.app",
  messagingSenderId: "961986234499",
  appId: "1:961986234499:web:53395a82ab0ab2b5a8b3b6",
  measurementId: "G-QJYY1YBXFZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
