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
        <div className="login"
            style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
            }}
        >
            <p>ログインして始める</p>
            <button onClick={signInWithGoogle} style={{
                margin: "5px",
                padding: "5px",
                borderRadius: "5px"
            }}>Googleでログイン</button>
        </div>
    );
};

export default Login;

