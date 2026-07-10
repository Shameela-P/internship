import { getCollection, updateDocument, deleteDocument, logAction } from '$lib/db';
import { requireRole } from '$lib/auth';
import { fail } from '@sveltejs/kit';

export async function load({ cookies }) {
	await requireRole(cookies, ['admin']);
	const [studentsData] = await Promise.all([
		getCollection('students')
	]);
	const db = { students: studentsData };
	
	const students = db.students.map(s => {
		// Calculate stats if needed, or just pass data
		return {
			id: s.id,
			fullName: s.fullName,
			email: s.email,
			collegeName: s.collegeName,
			department: s.department,
			isSuspended: s.isSuspended || false
		};
	});

	return {
		students
	};
}

export const actions = {
	toggleBlock: async ({ request, cookies }) => {
		const sessionUser = requireRole(cookies, ['admin']);
		const data = await request.formData();
		const studentId = data.get('studentId')?.toString();
		const suspend = data.get('suspend') === 'true';

		if (!studentId) return fail(400, { error: 'Student ID is required' });

		await updateDocument('students', studentId, { isSuspended: suspend });
		await logAction(suspend ? 'BLOCK_STUDENT' : 'UNBLOCK_STUDENT', `${suspend ? 'Blocked' : 'Unblocked'} student account: ${studentId}`, sessionUser.name, 'Admin', sessionUser.email, 'Admin Board');
		
		return { success: true };
	},
	deleteStudent: async ({ request, cookies }) => {
		const sessionUser = requireRole(cookies, ['admin']);
		const data = await request.formData();
		const studentId = data.get('studentId')?.toString();

		if (!studentId) return fail(400, { error: 'Student ID is required' });

		await deleteDocument('students', studentId);
		await logAction('DELETE_STUDENT', `Deleted student account: ${studentId}`, sessionUser.name, 'Admin', sessionUser.email, 'Admin Board');
		
		return { success: true };
	}
};
