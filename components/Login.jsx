import React from "react";
import { getAuth, signInWithPopup, GoogleAuthProvider, setPersistence, browserLocalPersistence } from "firebase/auth";
import { auth, provider } from "../firebase";
import { useNavigate } from "react-router-dom";

const Login = ({ }) => {
    const signInWithGoogle = async () => {
        try {
            await setPersistence(auth, browserLocalPersistence);
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            <p>ログインして始める</p>
            <button onClick={signInWithGoogle}>Googleでログイン</button>
        </div>
    );
};

export default Login;

