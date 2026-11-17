/* This file contains settings that are unique to one synagogue deployment. */

/* Copy this file beside index.html for every synagogue and change SITE_ID and firebase. */
window.APP_CONFIG = {
    /* A unique identifier prevents browser-local settings from overlapping between sites. */
    siteId: 'betkneset-001',

    /* The display fallback is used only when Firestore has no synagogue name yet. */
    siteName: 'ניהול בית הכנסת',

    /* Firebase JavaScript SDK version shared by the initialization module. */
    firebaseSdkVersion: '13.3.0',
    /* Firebase web-app configuration belongs to this synagogue deployment. */
    firebase: {
        /* Public Firebase web API key for this Firebase project. */
        apiKey: 'AIzaSyCTthCVxz18zIXT9Fpnzq_SgusBpINM-z8',
        /* Firebase Authentication domain for this project. */
        authDomain: 'betkneset-001.firebaseapp.com',
        /* Firebase project identifier used by the client SDK. */
        projectId: 'betkneset-001',
        /* Cloud Storage bucket associated with this Firebase project. */
        storageBucket: 'betkneset-001.firebasestorage.app',
        /* Numeric sender identifier registered for Firebase messaging services. */
        messagingSenderId: '300451630668',
        /* Firebase web application identifier for this project. */
        appId: '1:300451630668:web:baca3d9e40c06b79b86ee9',
        /* Optional Google Analytics measurement identifier. */
        measurementId: 'G-2XHKHB4PPR'
    },
    /* Firebase Cloud Functions deployment settings. */
    functions: {
        /* Region where this deployment's callable Cloud Functions are hosted. */
        region: 'me-west1',
        /* Names of callable functions used for congregant self-service operations. */
        callables: {
            /* Lists congregants available to the signed-in phone user. */
            listMyMembers: 'listMyMembers',
            /* Returns the permitted congregant data for the signed-in phone user. */
            getMemberData: 'getMemberData'
        }
    },
    /* Phone authentication settings used to format congregant phone numbers. */
    phoneAuth: {
        /* International calling code without a leading plus sign. */
        countryCallingCode: '972',
        /* National trunk prefix removed before adding the international calling code. */
        nationalPrefix: '0'
    },
    /* Google Drive OAuth and callable-function settings. */
    googleDrive: {
        /* Public OAuth client ID authorized for this web application. */
        clientId: '300451630668-ve7ohupjgtrjklc2gdr9ulbcaljsfsfm.apps.googleusercontent.com',
        /* Least-privilege Drive scope used by the backup integration. */
        scope: 'https://www.googleapis.com/auth/drive.file',
        /* Callable Cloud Function names must match the deployed server functions. */
        functions: {
            /* Returns a short-lived Google Drive access token. */
            getAccessToken: 'driveGetAccessToken',
            /* Links the Google account to the current administrator. */
            linkAccount: 'driveLinkAccount',
            /* Removes the persistent Google Drive account link. */
            unlink: 'driveUnlink'
        }
    },
    /* Firestore collection names and document path segments used by this application. */
    firestore: {
        /* Top-level collection containing each administrator's application data. */
        usersCollection: 'users',
        /* Subcollection segment containing the synagogue data documents. */
        dataSubcollection: 'data',
        /* Named data documents stored below users/{uid}/data/. */
        collections: {
            /* Congregant records document name. */
            members: 'members',
            /* Financial transaction records document name. */
            transactions: 'transactions',
            /* Funds and cashbox records document name. */
            funds: 'funds',
            /* Payment-purpose lookup document name. */
            paymentPurposes: 'paymentPurposes',
            /* Synagogue configuration document name. */
            config: 'config',
            /* Backup metadata document name. */
            backupMeta: 'backupMeta',
            /* Error-event collection name used by client-side diagnostics. */
            errorLogs: 'error_logs'
        }
    },
    /* Browser storage keys are prefixed with siteId by getSiteStorageKey(). */
    storageKeys: {
        /* Cached administrator login label. */
        authUser: 'authUser',
        /* Remembered congregant phone number. */
        lastWorshipperPhone: 'lastWorshipperPhone',
        /* Local database diagnostic history. */
        databaseLog: 'synagogue_dblog',
        /* Favorite report selections. */
        favoriteReports: 'synagogue_favorite_reports',
        /* Dark-mode preference. */
        darkMode: 'synagogue_dark_mode',
        /* Google Drive overwrite preference. */
        driveOverwrite: 'synagogue_drive_overwrite',
        /* Timestamp until which the Drive reminder banner stays hidden. */
        driveBannerHiddenUntil: 'synagogue_drive_banner_hidden_until',
        /* Locally remembered print sessions. */
        printSessions: 'synagogue_print_sessions',
        /* Legacy/local cache keys removed by the reset-data action. */
        members: 'synagogue_members',
        transactions: 'synagogue_transactions',
        config: 'synagogue_config',
        funds: 'synagogue_funds',
        /* Demo-mode data and expiry values. */
        demoData: 'synagogue_demo_data',
        demoExpiry: 'synagogue_demo_expiry'
    },
    /* Demo mode behavior is controlled independently for each deployment. */
    demo: {
        /* Query-string parameter that activates the demo environment. */
        queryParameter: 'demo',
        /* Demo data lifetime in milliseconds. */
        expiryMs: 7 * 24 * 60 * 60 * 1000
    },
    /* Feature switches that are currently read by the application runtime. */
    features: {
        /* Allow URL-triggered demo mode for this deployment. */
        demoMode: true
    },
    /* Operational limits used by the application runtime. */
    limits: {
        /* Maximum number of database diagnostic entries retained in browser memory. */
        dbLogEntries: 200
    },
    /* Delays used by transient save-status notifications. */
    timings: {
        /* Delay before the save-failure notification guard is reset. */
        saveFailureToastResetMs: 8000,
        /* Delay before the save-blocked notification guard is reset. */
        saveBlockedToastResetMs: 8000
    },
    /* Firestore transport behavior can be tuned for restrictive networks. */
    firestoreOptions: {
        /* Detect and use long-polling automatically when the network requires it. */
        experimentalAutoDetectLongPolling: true
    }
};

/* Build a browser-local key that is unique to this synagogue deployment. */
window.getSiteStorageKey = function (key) {
    /* Keep the site identifier and logical key separated to avoid accidental collisions. */
    return `${window.APP_CONFIG.siteId}_${key}`;
};

/* Fail early when a deployment is missing a critical identifier. */
if (!window.APP_CONFIG.siteId || !window.APP_CONFIG.firebase || !window.APP_CONFIG.firebase.projectId) {
    /* Stop initialization rather than silently connecting to an unintended Firebase project. */
    throw new Error('Invalid app-config.js: siteId and Firebase projectId are required.');
}
