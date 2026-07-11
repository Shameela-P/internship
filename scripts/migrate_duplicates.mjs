/**
 * Migration Script: Clean up duplicate applications
 * Detects duplicate applications (same studentId + internshipId),
 * keeps the oldest application record (based on creation timestamp/order),
 * inherits the latest status and actionDate, and deletes duplicates safely.
 * 
 * Run from project root: node scripts/migrate_duplicates.mjs
 */

import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, child, update, remove } from 'firebase/database';

const firebaseConfig = {
	apiKey: "AIzaSyDPr1lV-ChuWz91HhfReg8L21WKqmH0s-g",
	authDomain: "internship-portal-705f1.firebaseapp.com",
	databaseURL: "https://internship-portal-705f1-default-rtdb.firebaseio.com",
	projectId: "internship-portal-705f1",
	storageBucket: "internship-portal-705f1.firebasestorage.app",
	messagingSenderId: "784418638868",
	appId: "1:784418638868:web:bbddff4d4780fd758d2b01"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const dbRef = ref(database, '/');

async function migrate() {
    console.log('Fetching applications from Firebase...');
    const snapshot = await get(child(dbRef, 'applications'));
    if (!snapshot.exists()) {
        console.log('No applications found.');
        process.exit(0);
    }

    const data = snapshot.val();
    const applications = [];
    
    // Normalize into array of { key, val }
    if (Array.isArray(data)) {
        data.forEach((val, idx) => {
            if (val) applications.push({ key: idx.toString(), val });
        });
    } else if (typeof data === 'object') {
        Object.keys(data).forEach(key => {
            if (data[key]) applications.push({ key, val: data[key] });
        });
    }

    console.log(`Loaded ${applications.length} applications.`);

    // Group by studentId + internshipId
    const groups = {};
    applications.forEach(app => {
        const idMap = `${app.val.studentId}_${app.val.internshipId}`;
        if (!groups[idMap]) {
            groups[idMap] = [];
        }
        groups[idMap].push(app);
    });

    let duplicatesFound = 0;
    let recordsDeleted = 0;

    for (const [idMap, group] of Object.entries(groups)) {
        if (group.length > 1) {
            duplicatesFound++;
            console.log(`Found ${group.length} applications for pair: ${idMap}`);

            // Sort by appliedDate to find the oldest. If no appliedDate, use id.
            group.sort((a, b) => {
                const dateA = new Date(a.val.appliedDate || 0).getTime();
                const dateB = new Date(b.val.appliedDate || 0).getTime();
                if (dateA !== dateB) return dateA - dateB;
                // fallback to key
                return a.key.localeCompare(b.key);
            });

            const oldest = group[0];
            const duplicates = group.slice(1);

            let latestApp = group[0];
            for (const app of group) {
                const latestTime = new Date(latestApp.val.actionDate || latestApp.val.appliedDate || 0).getTime();
                const appTime = new Date(app.val.actionDate || app.val.appliedDate || 0).getTime();
                if (appTime > latestTime) {
                    latestApp = app;
                }
            }

            // Keep the oldest, but merge the status
            const statusUpdates = {
                status: latestApp.val.status,
                actionDate: latestApp.val.actionDate || '',
                certificateHash: latestApp.val.certificateHash || oldest.val.certificateHash || ''
            };

            console.log(`  Merging status: ${statusUpdates.status} into original record (key: ${oldest.key})`);
            await update(child(dbRef, `applications/${oldest.key}`), statusUpdates);

            // Delete duplicates
            for (const dup of duplicates) {
                console.log(`  Deleting duplicate record (key: ${dup.key})`);
                await remove(child(dbRef, `applications/${dup.key}`));
                recordsDeleted++;
            }
        }
    }

    console.log('Migration complete!');
    console.log(`Duplicate groups found: ${duplicatesFound}`);
    console.log(`Duplicate records deleted: ${recordsDeleted}`);
    
    process.exit(0);
}

migrate().catch(console.error);
