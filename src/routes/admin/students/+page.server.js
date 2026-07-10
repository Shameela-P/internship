import { getCollection, updateDocument, deleteDocument, logAction } from '$lib/db';
import { requireRole } from '$lib/auth';
import { fail } from '@sveltejs/kit';

export async function load({ cookies }) {
	const user = await requireRole(cookies, ['admin']);
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
			isBlocked: s.isBlocked || false
		};
	});

	return {
		students,
		user
	};
}

export const actions = {
	toggleBlock: async ({ request, cookies }) => {
		const admin = await requireRole(cookies, ['admin']);
		const formData = await request.formData();
		const studentId = formData.get('studentId');
		
		if (!studentId) return fail(400, { success: false, error: 'Student ID missing' });

		const students = await getCollection('students');
		const student = students.find(s => s.id === studentId);
		
		if (!student) return fail(404, { success: false, error: 'Student not found' });
		
		const newStatus = !student.isBlocked;
		await updateDocument('students', studentId, { isBlocked: newStatus });
		
		const actionType = newStatus ? 'STUDENT_BLOCK' : 'STUDENT_UNBLOCK';
		await logAction(actionType, `Admin ${admin.name} ${newStatus ? 'blocked' : 'unblocked'} student ${student.email}`, admin.name, 'Admin', admin.email, studentId, 'N/A');
		
		return { success: true };
	},
	deleteStudent: async ({ request, cookies }) => {
		const admin = await requireRole(cookies, ['admin']);
		const formData = await request.formData();
		const studentId = formData.get('studentId');
		
		if (!studentId) return fail(400, { success: false, error: 'Student ID missing' });
		
		const students = await getCollection('students');
		const student = students.find(s => s.id === studentId);
		if (!student) return fail(404, { success: false, error: 'Student not found' });

		await deleteDocument('students', studentId);
		await logAction('STUDENT_DELETE', `Admin ${admin.name} deleted student ${student.email}`, admin.name, 'Admin', admin.email, studentId, 'N/A');
		
		return { success: true };
	}
};
