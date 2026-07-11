import { getCollection, deleteDocument } from './db.js';

async function run() {
    const emailsToDelete = [
        'shameela55qts@gmail.com', 
        'shameela5qts@gmail.com', 
        'santhiyabill10293@gmail.com'
    ];
    
    // Check students
    const students = await getCollection('students');
    for (const s of students) {
        if (s && s.email && emailsToDelete.includes(s.email.toLowerCase())) {
            console.log(`Deleting student: ${s.email} (id: ${s.id})`);
            await deleteDocument('students', s.id);
        }
    }
    
    // Check companies
    const companies = await getCollection('companies');
    for (const c of companies) {
        if (c && c.companyEmail && emailsToDelete.includes(c.companyEmail.toLowerCase())) {
            console.log(`Deleting company: ${c.companyEmail} (id: ${c.id})`);
            await deleteDocument('companies', c.id);
        }
    }

    // Check admins
    const admins = await getCollection('admins');
    for (const a of admins) {
        if (a && a.email && emailsToDelete.includes(a.email.toLowerCase())) {
            console.log(`Deleting admin: ${a.email} (id: ${a.id})`);
            await deleteDocument('admins', a.id);
        }
    }

    console.log("Done deleting users.");
    process.exit(0);
}

run().catch(console.error);
