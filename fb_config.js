        // Importing the necessary libraries from Google servers
        import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
        import { initializeFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
        import {
            getAuth, signInWithEmailAndPassword, sendPasswordResetEmail, onAuthStateChanged, signOut,
            signInWithPhoneNumber, RecaptchaVerifier, PhoneAuthProvider, linkWithCredential, unlink
        } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
        import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-functions.js";

        // ===== DEMO MODE: Completely skipping Firebase initialization  =====
        if (!window.IS_DEMO) {
            //The data you received from the console
            const firebaseConfig = {
                apiKey: "AIzaSyCKCHyKJTkXYtCS2p3J027jJfnI04npk7I",
                authDomain: "en-shemer-booking.firebaseapp.com",
                databaseURL: "https://en-shemer-booking-default-rtdb.firebaseio.com",
                projectId: "en-shemer-booking",
                storageBucket: "en-shemer-booking.firebasestorage.app",
                messagingSenderId: "1023003700732",
                appId: "1:1023003700732:web:6f67a1c6388517930c1679"
            };

            //init application
            const app = initializeApp(firebaseConfig);
            // זיהוי אוטומטי של חיבור long-polling: פותר חיבורים איטיים/תקועים ברשתות, פרוקסי ותוכנות סינון
            const db = initializeFirestore(app, { experimentalAutoDetectLongPolling: true });
            const auth = getAuth(app);
            // האזור חייב להתאים לאזור שאליו פרוסות ה-Cloud Functions (functions/index.js -> REGION)
            const functions = getFunctions(app, 'me-west1');

            // Expose Firebase tools to the global window scope for Alpine.js
            window.db = db;
            window.auth = auth;
            window.functions = functions;
            window.fsMethods = {
                doc, setDoc, getDoc, signInWithEmailAndPassword, sendPasswordResetEmail, onAuthStateChanged, signOut,
                signInWithPhoneNumber, RecaptchaVerifier, httpsCallable, PhoneAuthProvider, linkWithCredential, unlink
            };

            console.log("snir - Firebase initialized successfully");
        } else {
            console.log("Demo mode - Firebase not initialized");
        }
        // ===== END DEMO MODE =====
