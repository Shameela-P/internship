import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';
import {
	PUBLIC_FIREBASE_API_KEY,
	PUBLIC_FIREBASE_AUTH_DOMAIN,
	PUBLIC_FIREBASE_DATABASE_URL,
	PUBLIC_FIREBASE_PROJECT_ID,
	PUBLIC_FIREBASE_STORAGE_BUCKET,
	PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
	PUBLIC_FIREBASE_APP_ID,
	PUBLIC_FIREBASE_MEASUREMENT_ID
} from '$env/static/public';

const firebaseConfig = {
	apiKey: PUBLIC_FIREBASE_API_KEY?.trim(),
	authDomain: PUBLIC_FIREBASE_AUTH_DOMAIN?.trim(),
	databaseURL: PUBLIC_FIREBASE_DATABASE_URL?.trim(),
	projectId: PUBLIC_FIREBASE_PROJECT_ID?.trim(),
	storageBucket: PUBLIC_FIREBASE_STORAGE_BUCKET?.trim(),
	messagingSenderId: PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.trim(),
	appId: PUBLIC_FIREBASE_APP_ID?.trim(),
	measurementId: PUBLIC_FIREBASE_MEASUREMENT_ID?.trim()
};

// Initialize Firebase only once (guard against HMR re-initialization)
let app;
if (!getApps().length) {
	app = initializeApp(firebaseConfig);
} else {
	app = getApp();
}

const auth = getAuth(app);
const database = getDatabase(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

// Request email and profile scopes
googleProvider.addScope('email');
googleProvider.addScope('profile');

export { app, auth, database, storage, googleProvider };
