import { getCollection, addDocument, DOMAINS } from '$lib/db.js';
import { json } from '@sveltejs/kit';

const subCategories = ['Remote', 'In-Office', 'Hybrid', 'Trainee', 'Associate', 'Intern', 'Specialist'];
const durations = ['1 Month', '2 Months', '3 Months', '6 Months', '12 Months'];
const stipends = [0, 5000, 8000, 10000, 15000, 20000, 25000];
const modes = ['Online', 'Offline', 'Hybrid'];
const types = ['Internship', 'Job Offer', 'Fellowship'];

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomElement(arr) {
    return arr[getRandomInt(0, arr.length - 1)];
}

const allSkills = ['Communication', 'Excel', 'Management', 'Research', 'JavaScript', 'Python', 'React', 'Node.js', 'Figma', 'AutoCAD', 'Marketing', 'SEO', 'Data Analysis', 'Java', 'C++', 'SQL', 'AWS', 'Docker', 'Android', 'Kotlin', 'Swift', 'Unity', 'C#'];

export async function GET() {
    try {
        console.log("Starting dataset expansion fix via API...");
        
        // Fetch all approved companies
        const companies = await getCollection('companies');
        const approvedCompanies = companies.filter(c => c.status === 'Approved');
        
        console.log(`Found ${approvedCompanies.length} approved companies.`);
        if (approvedCompanies.length === 0) return json({ error: 'No approved companies found!' }, { status: 400 });
        
        const categoryCounts = {};
        DOMAINS.forEach(d => categoryCounts[d.name] = 0);
        
        let createdCount = 0;

        for (const company of approvedCompanies) {
            // Generate 3-4 internships for each company
            const numInternships = getRandomInt(3, 4);
            
            for (let i = 0; i < numInternships; i++) {
                let domainObj = DOMAINS.find(d => categoryCounts[d.name] < 10) || getRandomElement(DOMAINS);
                categoryCounts[domainObj.name]++;
                
                const subCategory = getRandomElement(subCategories);
                const title = `${domainObj.name} ${subCategory}`;
                
                const skillsRequired = [];
                const numSkills = getRandomInt(3, 5);
                for(let k = 0; k < numSkills; k++) {
                    const s = getRandomElement(allSkills);
                    if (!skillsRequired.includes(s)) skillsRequired.push(s);
                }
                if (skillsRequired.length === 0) skillsRequired.push('Communication');

                const stipend = getRandomElement(stipends);
                const today = new Date();
                const futureDate = new Date(today);
                futureDate.setDate(today.getDate() + getRandomInt(10, 60));
                
                const internship = {
                    title,
                    domain: domainObj.name,
                    subCategory: domainObj.category, // using category for subCategory to match UI display
                    description: `We are looking for an enthusiastic ${title} to join our team at ${company.companyName}. You will be responsible for helping us achieve our goals and working closely with senior members. This is a fantastic opportunity to learn and grow.`,
                    companyId: company.id,
                    skillsRequired,
                    stipendAmount: stipend,
                    fee: 0,
                    duration: getRandomElement(durations),
                    mode: getRandomElement(modes),
                    location: company.companyAddress || 'Global',
                    type: getRandomElement(types),
                    openings: getRandomInt(1, 10),
                    status: 'Active',
                    hasCertificate: getRandomElement([true, false]),
                    lastDateToApply: futureDate.toISOString().split('T')[0],
                    createdAt: today.toISOString()
                };
                
                await addDocument('internships', internship);
                createdCount++;
            }
        }
        
        // Ensure ALL DOMAINS have at least 10 internships
        for (const domainObj of DOMAINS) {
            while (categoryCounts[domainObj.name] < 10) {
                const company = getRandomElement(approvedCompanies);
                
                const subCategory = getRandomElement(subCategories);
                const title = `${domainObj.name} ${subCategory}`;
                
                const skillsRequired = [];
                for(let k = 0; k < 4; k++) {
                    const s = getRandomElement(allSkills);
                    if (!skillsRequired.includes(s)) skillsRequired.push(s);
                }
                if (skillsRequired.length === 0) skillsRequired.push('Communication');

                const today = new Date();
                const futureDate = new Date(today);
                futureDate.setDate(today.getDate() + getRandomInt(10, 60));
                
                const internship = {
                    title,
                    domain: domainObj.name,
                    subCategory: domainObj.category,
                    description: `We are looking for an enthusiastic ${title} to join our team at ${company.companyName}. You will be responsible for helping us achieve our goals and working closely with senior members. This is a fantastic opportunity to learn and grow.`,
                    companyId: company.id,
                    skillsRequired,
                    stipendAmount: getRandomElement(stipends),
                    fee: 0,
                    duration: getRandomElement(durations),
                    mode: getRandomElement(modes),
                    location: company.companyAddress || 'Global',
                    type: getRandomElement(types),
                    openings: getRandomInt(1, 10),
                    status: 'Active',
                    hasCertificate: getRandomElement([true, false]),
                    lastDateToApply: futureDate.toISOString().split('T')[0],
                    createdAt: today.toISOString()
                };
                
                await addDocument('internships', internship);
                categoryCounts[domainObj.name]++;
                createdCount++;
            }
        }
        
        console.log(`Dataset expansion complete. Created ${createdCount} internships.`);
        return json({ success: true, createdCount });
    } catch(err) {
        console.error(err);
        return json({ error: err.message }, { status: 500 });
    }
}
