import { getCollection, updateDocument, deleteDocument, logAction } from '$lib/db';
import { requireRole } from '$lib/auth';

export async function load({ cookies }) {
	requireRole(cookies, ['admin']);
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
	suspendStudent: async ({ request, cookies }) => {
		try {
			const sessionUser = requireRole(cookies, ['admin']);
			const data = await request.formData();
			const studentId = data.get('studentId')?.toString();
			if (!studentId) return { success: false, error: 'Student ID is required' };

			await updateDocument('students', studentId, { isSuspended: true });
			await logAction('SUSPEND_STUDENT', `Suspended student account: ${studentId}`, sessionUser.name, 'Admin', sessionUser.email, 'Admin Board');
			return { success: true };
		} catch (err) {
			return { success: false, error: err.message };
		}
	},
	unsuspendStudent: async ({ request, cookies }) => {
		try {
			const sessionUser = requireRole(cookies, ['admin']);
			const data = await request.formData();
			const studentId = data.get('studentId')?.toString();
			if (!studentId) return { success: false, error: 'Student ID is required' };

			await updateDocument('students', studentId, { isSuspended: false });
			await logAction('UNSUSPEND_STUDENT', `Unsuspended student account: ${studentId}`, sessionUser.name, 'Admin', sessionUser.email, 'Admin Board');
			return { success: true };
		} catch (err) {
			return { success: false, error: err.message };
		}
	},
	deleteStudent: async ({ request, cookies }) => {
		try {
			const sessionUser = requireRole(cookies, ['admin']);
			const data = await request.formData();
			const studentId = data.get('studentId')?.toString();
			if (!studentId) return { success: false, error: 'Student ID is required' };

			await deleteDocument('students', studentId);
			await logAction('DELETE_STUDENT', `Deleted student account: ${studentId}`, sessionUser.name, 'Admin', sessionUser.email, 'Admin Board');
			return { success: true };
		} catch (err) {
			return { success: false, error: err.message };
		}
	}
};
