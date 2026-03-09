import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBh4pTIk536hR_JrSSppWIH05KA5v3G9a4",
  authDomain: "bluffy-edfb3.firebaseapp.com",
  databaseURL: "https://bluffy-edfb3-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "bluffy-edfb3",
  storageBucket: "bluffy-edfb3.firebasestorage.app",
  messagingSenderId: "1032124405910",
  appId: "1:1032124405910:web:1173d6784820ab1a1d4ab7"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);