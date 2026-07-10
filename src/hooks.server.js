import { redirect } from '@sveltejs/kit';
import { verifyToken } from '$lib/auth';
import { getDocument } from '$lib/db';

export async function handle({ event, resolve }) {
	const pathname = event.url.pathname;
	
	// Only intercept protected routes
	if (pathname.startsWith('/student') || pathname.startsWith('/company') || pathname.startsWith('/admin')) {
		const sessionCookie = event.cookies.get('nexora_session');
		
		if (sessionCookie) {
			// First, do a fast JWT decoding (doesn't hit DB yet)
			const user = verifyToken(sessionCookie);
			
			if (user) {
				try {
					// Second, verify the user still exists and is not blocked in the database
					if (user.role === 'student' && pathname.startsWith('/student')) {
						const student = await getDocument('students', user.id);
						if (!student || student.isSuspended || student.isBlocked) {
							event.cookies.delete('nexora_session', { path: '/' });
							throw redirect(303, '/login?error=account_blocked');
						}
					} else if (user.role === 'company' && pathname.startsWith('/company')) {
						const company = await getDocument('companies', user.id);
						if (!company || company.isSuspended || company.isBlocked) {
							event.cookies.delete('nexora_session', { path: '/' });
							throw redirect(303, '/login?error=account_blocked');
						}
					} else if (user.role === 'admin' && pathname.startsWith('/admin')) {
						const admin = await getDocument('admins', user.id);
						if (!admin) {
							event.cookies.delete('nexora_session', { path: '/' });
							throw redirect(303, '/login');
						}
					}
				} catch (e) {
					if (e.status === 303) throw e;
					console.error("Hook DB error:", e);
				}
			}
		}
	}

	return resolve(event);
}
