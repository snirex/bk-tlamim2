/** DONT CHANGE THIS FILE */
/**************************/

/* Read the deployment-specific configuration loaded by app-config.js. */
const config = window.APP_CONFIG;

/* Build the Firebase SDK base URL from the centrally configured version. */
const firebaseSdkBase = `https://www.gstatic.com/firebasejs/${config.firebaseSdkVersion}`;

/* Load the Firebase app module at the configured SDK version. */
const appSdk = await import(`${firebaseSdkBase}/firebase-app.js`);
/* Load Firestore initialization and document helpers used by the application. */
const firestoreSdk = await import(`${firebaseSdkBase}/firebase-firestore.js`);
/* Load Firebase Authentication methods used by administrator and congregant login. */
const authSdk = await import(`${firebaseSdkBase}/firebase-auth.js`);
/* Load callable Cloud Functions support for server-side workflows. */
const functionsSdk = await import(`${firebaseSdkBase}/firebase-functions.js`);

/* Skip Firebase initialization when the URL explicitly activates demo mode. */
if (!window.IS_DEMO) {
    /* Create the Firebase application using the current synagogue's project settings. */
    const app = appSdk.initializeApp(config.firebase);
    /* Initialize Firestore with the configured network transport options. */
    const db = firestoreSdk.initializeFirestore(app, config.firestoreOptions);
    /* Initialize Firebase Authentication for this Firebase application. */
    const auth = authSdk.getAuth(app);
    /* Initialize callable functions in the configured deployment region. */
    const functions = functionsSdk.getFunctions(app, config.functions.region);

    /* Expose the Firestore database to the existing Alpine application code. */
    window.db = db;
    /* Expose the Authentication instance to the existing Alpine application code. */
    window.auth = auth;
    /* Expose the Cloud Functions instance to the existing Alpine application code. */
    window.functions = functions;
    /* Preserve the existing global method registry and include all methods used by the page. */
    window.fsMethods = {
        doc: firestoreSdk.doc,
        setDoc: firestoreSdk.setDoc,
        getDoc: firestoreSdk.getDoc,
        collection: firestoreSdk.collection,
        addDoc: firestoreSdk.addDoc,
        signInWithEmailAndPassword: authSdk.signInWithEmailAndPassword,
        sendPasswordResetEmail: authSdk.sendPasswordResetEmail,
        onAuthStateChanged: authSdk.onAuthStateChanged,
        signOut: authSdk.signOut,
        signInWithPhoneNumber: authSdk.signInWithPhoneNumber,
        RecaptchaVerifier: authSdk.RecaptchaVerifier,
        httpsCallable: functionsSdk.httpsCallable,
        PhoneAuthProvider: authSdk.PhoneAuthProvider,
        linkWithCredential: authSdk.linkWithCredential,
        unlink: authSdk.unlink,
        EmailAuthProvider: authSdk.EmailAuthProvider,
        reauthenticateWithCredential: authSdk.reauthenticateWithCredential,
        updatePassword: authSdk.updatePassword
    };

    /* Confirm successful initialization for browser-console diagnostics. */
    console.log(`Firebase initialized successfully for ${config.siteId} (${config.firebase.projectId}).`);
} else {
    /* Keep the demo environment fully local without initializing Firebase services. */
    console.log(`Demo mode active for ${config.siteId}; Firebase was not initialized.`);
}
