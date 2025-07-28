import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAp5rRZHdykkD5Y4hySK4d_fx_3yGpkkvY",
  authDomain: "imusic-88c88.firebaseapp.com",
  projectId: "imusic-88c88",
  storageBucket: "imusic-88c88.firebasestorage.app",
  messagingSenderId: "973201866703",
  appId: "1:973201866703:web:7078c547d48db27b655cba",
  measurementId: "G-QF7XK6HCYJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getFirestore(app);


