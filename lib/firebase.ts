
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBdmm58juT-4EL5Vc78sXhtqNZ8dsxvq8c",
  authDomain: "ua-mock-test-app.firebaseapp.com",
  projectId: "ua-mock-test-app",
  storageBucket: "ua-mock-test-app.firebasestorage.app",
  messagingSenderId: "61853540448",
  appId: "1:61853540448:web:44d453ad24e2d3023b6305",
  measurementId: "G-ZCF09TNVEB"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
