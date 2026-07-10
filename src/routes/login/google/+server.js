import { json } from '@sveltejs/kit';
import { updateDocument, addDocument, logAction, queryDocumentsPaginated } from '$lib/db';
import { createToken } from '$lib/auth';
import { dev } from '$app/environment';

export async function POST({ request, cookies }) {
	try {
		const { email, name, photoURL, uid, role } = await request.json();

		if (!email || !name || !role || !uid) {
			return json({ error: 'Missing required Google Auth payload fields.' }, { status: 400 });
		}

		let user = null;
		let redirectPath = '/';

		// 1. Check if user already exists using targeted query to prevent stale cache issues
		const [studentsData, companiesData, adminsData] = await Promise.all([
			queryDocumentsPaginated('students', 'email', email, 1),
			queryDocumentsPaginated('companies', 'companyEmail', email, 1),
			queryDocumentsPaginated('admins', 'email', email, 1)
		]);

		const existingStudent = studentsData[0];
		const existingCompany = companiesData[0];
		const existingAdmin = adminsData[0];

		if (existingAdmin) {
			user = { id: existingAdmin.id, role: 'admin', email };
			redirectPath = '/admin';
		} else if (existingStudent) {
			// They signed up as student previously
			if (existingStudent.isBlocked) {
				return json({ error: 'Account has been blocked by administrator.' }, { status: 403 });
			}
			user = { id: existingStudent.id, role: 'student', email };
			redirectPath = '/student';
			
			// Optional: Update photoURL if changed
			if (photoURL && existingStudent.profilePhoto !== photoURL) {
				existingStudent.profilePhoto = photoURL;
				await updateDocument('students', existingStudent.id, { profilePhoto: photoURL });
			}
		} else if (existingCompany) {
			if (existingCompany.isSuspended) {
				return json({ error: 'Company account is suspended.' }, { status: 403 });
			}
			user = { id: existingCompany.id, role: 'company', email };
			redirectPath = '/company';
		} else {
			// 2. User does not exist. Auto-register them based on selected role!
			if (role === 'student') {
				const newStudent = {
					id: uid, // Use Firebase Auth UID
					fullName: name,
					email: email,
					mobileNumber: '', 
					password: '', 
					collegeName: 'Update Profile',
					degreeCourse: 'Update Profile',
					department: 'Update Profile',
					yearOfStudy: '1',
					currentStatus: 'Student',
					skills: [],
					address: 'Update Profile',
					profilePhoto: photoURL || '',
					resumeUrl: '',
					isBlocked: false,
					createdAt: new Date().toISOString()
				};
				await addDocument('students', newStudent);
				
				user = { id: newStudent.id, role: 'student', email };
				redirectPath = '/student';
			} else if (role === 'company') {
				const newCompany = {
					id: uid, // Use Firebase Auth UID
					companyName: name,
					companyEmail: email,
					companyContactNumber: '',
					website: '',
					companyAddress: 'Update Profile',
					companyDescription: 'Update Profile',
					industryType: 'Software & IT',
					companyLogo: photoURL || '',
					password: '', 
					status: 'Pending', // Pending admin approval
					isSuspended: false,
					createdAt: new Date().toISOString()
				};
				await addDocument('companies', newCompany);

				user = { id: newCompany.id, role: 'company', email };
				redirectPath = '/company';
			} else {
				return json({ error: 'Invalid role selection for new user.' }, { status: 400 });
			}
		}

		// 3. Generate JWT Token using the shared custom implementation
		const token = createToken({ id: user.id, role: user.role, email: user.email, name: name });

		// 4. Set Session Cookie
		cookies.set('nexora_session', token, {
			path: '/',
			httpOnly: true,
			secure: !dev,
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 // 24 hours
		});
		
		const roleFormatted = user.role.charAt(0).toUpperCase() + user.role.slice(1);
		const ip = request.headers.get('x-forwarded-for') || 'Unknown IP';
		logAction(`${user.role.toUpperCase()}_LOGIN`, `Logged in via Google`, name, roleFormatted, email, 'Dashboard', ip);

		return json({ success: true, redirect: redirectPath });

	} catch (err) {
		console.error('Google Auth Handler Error:', err);
		return json({ error: 'Internal Server Error processing Google login.' }, { status: 500 });
	}
}
