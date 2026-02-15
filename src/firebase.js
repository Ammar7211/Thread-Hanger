// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth"; //

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB6so3SkxaK32Q5DmuzT2ikBnSGK38afzw",
  authDomain: "e-commerce-6e573.firebaseapp.com",
  databaseURL: "https://e-commerce-6e573-default-rtdb.firebaseio.com",
  projectId: "e-commerce-6e573",
  storageBucket: "e-commerce-6e573.firebasestorage.app",
  messagingSenderId: "660595963443",
  appId: "1:660595963443:web:f33ff749e92be773711546",
  measurementId: "G-TS53WY9YXF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// ADD THESE TWO LINES
export const auth = getAuth(app); // This exports 'auth' for App.jsx
export default app;