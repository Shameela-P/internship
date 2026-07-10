import { getSessionUser } from '$lib/auth';
import { redirect } from '@sveltejs/kit';

export async function handle({ event, resolve }) {
    // 1. Get current user from cookies
    const user = getSessionUser(event.cookies);
    event.locals.user = user || null;

    const path = event.url.pathname;

    // 2. Define protected routes and their required roles
    // The admin has access to everything for management purposes, but primarily their own route.
    const protectedRoutes = [
        { prefix: '/student', roles: ['student', 'admin'] },
        { prefix: '/company', roles: ['company', 'admin'] },
        { prefix: '/admin', roles: ['admin'] },
        { prefix: '/api/messages', roles: ['student', 'company', 'admin'] },
        { prefix: '/api/notifications', roles: ['student', 'company', 'admin'] }
    ];

    // 3. Check if the current route is protected
    const route = protectedRoutes.find(r => path.startsWith(r.prefix));

    if (route) {
        // If not logged in, redirect to login
        if (!user) {
            // If it's an API route, return 401 instead of redirecting
            if (path.startsWith('/api/')) {
                return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' }});
            }
            throw redirect(303, `/login?redirectTo=${encodeURIComponent(path)}`);
        }

        // If logged in but wrong role, redirect to their own dashboard
        if (!route.roles.includes(user.role)) {
             if (path.startsWith('/api/')) {
                return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { 'Content-Type': 'application/json' }});
            }
            throw redirect(303, `/${user.role}`);
        }
    }

    // 4. Prevent logged-in users from accessing login/register flows
    const publicOnlyRoutes = ['/login', '/register', '/register-company'];
    if (user && publicOnlyRoutes.includes(path)) {
        throw redirect(303, `/${user.role}`);
    }

    // 5. Proceed with the request
    const response = await resolve(event);
    return response;
}
