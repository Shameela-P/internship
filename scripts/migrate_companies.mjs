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

async function migrateData() {
    console.log('Starting Migration...');

    // Migrate Companies
    console.log('Migrating Companies...');
    const companiesSnapshot = await get(ref(db, 'companies'));
    if (companiesSnapshot.exists()) {
        const companies = companiesSnapshot.val();
        let companyUpdates = {};
        let updatedCompanyCount = 0;

        for (const [key, company] of Object.entries(companies)) {
            if (company.status === 'Approved') {
                if (company.approved === undefined || company.canPostInternships === undefined) {
                    companyUpdates[`companies/${key}/approved`] = true;
                    companyUpdates[`companies/${key}/canPostInternships`] = true;
                    if (!company.approvedAt) companyUpdates[`companies/${key}/approvedAt`] = new Date().toISOString();
                    if (!company.approvedBy) companyUpdates[`companies/${key}/approvedBy`] = 'system_migration';
                    updatedCompanyCount++;
                }
            } else if (company.status === 'Pending') {
                if (company.approved === undefined || company.canPostInternships === undefined) {
                    companyUpdates[`companies/${key}/approved`] = false;
                    companyUpdates[`companies/${key}/canPostInternships`] = false;
                    updatedCompanyCount++;
                }
            }
        }
        
        if (Object.keys(companyUpdates).length > 0) {
            await update(ref(db), companyUpdates);
            console.log(`Updated ${updatedCompanyCount} companies.`);
        } else {
            console.log('No companies needed updates.');
        }
    }

    // Migrate Internships
    console.log('Migrating Internships...');
    const internshipsSnapshot = await get(ref(db, 'internships'));
    const allCompaniesSnapshot = await get(ref(db, 'companies'));
    const companies = allCompaniesSnapshot.val() || {};

    if (internshipsSnapshot.exists()) {
        const internships = internshipsSnapshot.val();
        let internshipUpdates = {};
        let updatedInternshipCount = 0;

        for (const [key, internship] of Object.entries(internships)) {
            let needsUpdate = false;
            const company = companies[internship.companyId] || {};

            if (internship.internshipId === undefined) {
                internshipUpdates[`internships/${key}/internshipId`] = key;
                needsUpdate = true;
            }
            if (internship.companyName === undefined) {
                internshipUpdates[`internships/${key}/companyName`] = company.companyName || 'Unknown Company';
                needsUpdate = true;
            }
            if (internship.companyLogo === undefined) {
                internshipUpdates[`internships/${key}/companyLogo`] = company.companyLogo || '';
                needsUpdate = true;
            }
            if (internship.companyDomain === undefined) {
                internshipUpdates[`internships/${key}/companyDomain`] = company.website || '';
                needsUpdate = true;
            }
            if (internship.companyStatus === undefined) {
                internshipUpdates[`internships/${key}/companyStatus`] = company.status || 'Approved';
                needsUpdate = true;
            }
            if (internship.updatedAt === undefined) {
                internshipUpdates[`internships/${key}/updatedAt`] = new Date().toISOString();
                needsUpdate = true;
            }

            if (needsUpdate) {
                updatedInternshipCount++;
            }
        }

        if (Object.keys(internshipUpdates).length > 0) {
            await update(ref(db), internshipUpdates);
            console.log(`Updated ${updatedInternshipCount} internships.`);
        } else {
            console.log('No internships needed updates.');
        }
    }

    console.log('Migration Complete.');
    process.exit(0);
}

migrateData().catch(console.error);
