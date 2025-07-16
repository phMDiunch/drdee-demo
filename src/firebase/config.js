// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCL9-Tx4LBc4QGUgJsbzbt8O1x7VZAc9_M",
  authDomain: "drdee-demo.firebaseapp.com",
  projectId: "drdee-demo",
  storageBucket: "drdee-demo.firebasestorage.app",
  messagingSenderId: "1026273846537",
  appId: "1:1026273846537:web:1a926a60218ff4f81c1fd8",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
