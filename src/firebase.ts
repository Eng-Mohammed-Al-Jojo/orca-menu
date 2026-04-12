/*----*/

import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAuQqaxFv_f4WLSVKjuE9Wj5hqsKmhmqCk",
  authDomain: "orca-menu.firebaseapp.com",
  databaseURL: "https://orca-menu-default-rtdb.firebaseio.com",
  projectId: "orca-menu",
  storageBucket: "orca-menu.firebasestorage.app",
  messagingSenderId: "332986868252",
  appId: "1:332986868252:web:5ddaa7d6c70219e56df5d9"
};

const app = initializeApp(firebaseConfig);

// 👇 هذا هو المهم
export const db = getDatabase(app);
export const auth = getAuth(app);
