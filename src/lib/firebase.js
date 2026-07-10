import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';
import { env } from '$env/dynamic/public';
import { building } from '$app/environment';

const firebaseConfig = {
	apiKey: env.PUBLIC_FIREBASE_API_KEY?.trim() || (building ? 'mock-api-key' : ''),
	authDomain: env.PUBLIC_FIREBASE_AUTH_DOMAIN?.trim() || (building ? 'mock-auth-domain' : ''),
	databaseURL: 'https://internship-7f490-default-rtdb.firebaseio.com',
	projectId: env.PUBLIC_FIREBASE_PROJECT_ID?.trim() || (building ? 'mock-project-id' : ''),
	storageBucket: env.PUBLIC_FIREBASE_STORAGE_BUCKET?.trim() || (building ? 'mock-bucket' : ''),
	messagingSenderId: env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.trim() || (building ? 'mock-sender' : ''),
	appId: env.PUBLIC_FIREBASE_APP_ID?.trim() || (building ? 'mock-app-id' : ''),
	measurementId: env.PUBLIC_FIREBASE_MEASUREMENT_ID?.trim() || (building ? 'mock-measurement-id' : '')
};
console.log("[VERCEL BUILD] Firebase Config Init:", { ...firebaseConfig, apiKey: 'HIDDEN' });

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
