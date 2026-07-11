import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, update } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyCgBD4oA0v1nBrFX6pqvzU4yo0W5AYv-5o",
  authDomain: "internship-7f490.firebaseapp.com",
  databaseURL: "https://internship-7f490-default-rtdb.firebaseio.com",
  projectId: "internship-7f490",
  storageBucket: "internship-7f490.firebasestorage.app",
  messagingSenderId: "290328150088",
  appId: "1:290328150088:web:457112b1962eb4d5aa587d",
  measurementId: "G-11E1XF0V9T"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

async function checkCompanies() {
    console.log('Checking Companies...');
    const companiesSnapshot = await get(ref(db, 'companies'));
    if (companiesSnapshot.exists()) {
        const companies = companiesSnapshot.val();
        let count = 0;
        let updates = {};
        for (const [key, c] of Object.entries(companies)) {
            if (c && c.status === 'Approved' && (!c.canPostInternships || !c.approved)) {
                console.log('Fixing broken company:', c.companyName);
                updates[`companies/${key}/approved`] = true;
                updates[`companies/${key}/canPostInternships`] = true;
                count++;
            }
        }
        if (count > 0) {
            await update(ref(db), updates);
            console.log(`Fixed ${count} companies.`);
        } else {
            console.log("No broken companies found.");
        }
    }
    process.exit(0);
}

checkCompanies().catch(console.error);
