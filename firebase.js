// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBZp2BrC7cFRJ60edB88Q3GoxvRPJpxg2E",
    authDomain: "tripwise-b0f6b.firebaseapp.com",
    projectId: "tripwise-b0f6b",
    storageBucket: "tripwise-b0f6b.firebasestorage.app",
    messagingSenderId: "590700727535",
    appId: "1:590700727535:web:4921be606d17beba67df1a",
    measurementId: "G-09LKXSQ4W0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// 追加の記述
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

export {auth, provider, db}; // 別ファイルで使えるようにexport
