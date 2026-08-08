import { getCollection, addDocument, updateDocument } from '$lib/db';
import { requireRole } from '$lib/auth';
import { fail } from '@sveltejs/kit';

export async function load({ cookies }) {
	const sessionUser = requireRole(cookies, ['student']);
	
	const [student, companiesData, messagesData] = await Promise.all([
		getDocument('students', sessionUser.id),
		queryDocumentsPaginated('companies', 'status', 'Approved', 100),
		getCollection('messages')
	]);

	if (!student) {
		throw redirect(303, '/login');
	}

	const messagesList = messagesData || [];

	// Filter messages involving this student
	const userMessages = messagesList.filter(m => 
		m && m.senderEmail && m.recipientEmail &&
		(m.senderEmail.toLowerCase() === student.email.toLowerCase() || 
		 m.recipientEmail.toLowerCase() === student.email.toLowerCase())
	);

	// Automatically mark incoming messages as read
	for (const m of messagesList) {
		if (m && m.recipientEmail && m.recipientEmail.toLowerCase() === student.email.toLowerCase() && !m.read) {
			m.read = true;
			// Don't wait for all DB updates to finish before rendering the page! Fire and forget.
			updateDocument('messages', m.id, { read: true }).catch(e => console.error("Update read status failed", e));
		}
	}

	// Contacts list: 100 verified companies + Admin Support
	const companies = (companiesData || []).filter(c => c && !c.isSuspended)
		.map(c => ({
			name: c.companyName,
			email: c.companyEmail,
			role: 'company'
		}));

	const contacts = [
		{ name: 'Nexora Admin Support', email: 'admin@nexora.com', role: 'admin' },
		...companies
	];

	return {
		student,
		messages: userMessages,
		contacts
	};
}

export const actions = {
	sendMessage: async ({ request, cookies }) => {
		const sessionUser = requireRole(cookies, ['student']);
		const student = await getDocument('students', sessionUser.id);
		
		if (!student) {
			return fail(400, { success: false, error: 'Student profile not found' });
		}

		const formData = await request.formData();
		const recipientEmail = formData.get('recipientEmail')?.toString().trim();
		const recipientRole = formData.get('recipientRole')?.toString().trim();
		const recipientName = formData.get('recipientName')?.toString().trim();
		const content = formData.get('content')?.toString().trim();

		if (!recipientEmail || !recipientRole || !content) {
			return fail(400, { success: false, error: 'Recipient details or content is required' });
		}

		const newMessage = {
			id: `msg_${Date.now()}`,
			senderEmail: student.email,
			senderRole: 'student',
			senderName: student.fullName,
			recipientEmail,
			recipientRole,
			recipientName: recipientName || 'User',
			content: content,
			timestamp: new Date().toISOString(),
			read: false
		};

		await addDocument('messages', newMessage);
		
		// Fire notification in background without blocking response
		addDocument('notifications', {
			id: 'notif_' + Date.now(),
			recipientEmail,
			recipientRole: recipientRole,
			subject: 'New Message from ' + newMessage.senderName,
			body: 'You received a new message: "' + content.substring(0, 50) + '..."',
			date: new Date().toISOString(),
			read: false
		}).catch(e => console.error('Failed to add notification', e));

		return { success: true };
	}
};
