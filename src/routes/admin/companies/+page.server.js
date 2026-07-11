import { logAction, getCollection, updateDocument, getDocument, addDocument } from '$lib/db';
import { requireRole } from '$lib/auth';

export async function load({ cookies }) {
	requireRole(cookies, ['admin']);
	const companiesData = await getCollection('companies');

	// Reverse to show newest first
	const companies = [...companiesData].reverse();

	return {
		companies
	};
}

export const actions = {
	updateStatus: async ({ request, cookies }) => {
		const sessionUser = requireRole(cookies, ['admin']);
		const data = await request.formData();
		const companyId = data.get('companyId');
		const newStatus = data.get('status');

		const updates = { status: newStatus };
		if (newStatus === 'Suspended' || newStatus === 'Rejected') {
			updates.isSuspended = newStatus === 'Suspended';
			updates.approved = false;
			updates.canPostInternships = false;
		} else if (newStatus === 'Approved') {
			updates.isSuspended = false;
			updates.approved = true;
			updates.canPostInternships = true;
			updates.approvedAt = new Date().toISOString();
			updates.approvedBy = sessionUser.id;
		}

		const company = await getDocument('companies', companyId);

		await updateDocument('companies', companyId, updates);
		await logAction('UPDATE_COMPANY_STATUS', `Admin changed company ${companyId} status to ${newStatus}`);
		
		if (company) {
			let subject = '';
			let body = '';
			if (newStatus === 'Approved') {
				subject = 'Company Profile Approved';
				body = `Congratulations! Your company profile for ${company.companyName} has been approved. You can now post internships.`;
			} else if (newStatus === 'Rejected' || newStatus === 'Suspended') {
				subject = `Company Profile ${newStatus}`;
				body = `Your company profile for ${company.companyName} has been ${newStatus.toLowerCase()}. Please contact support for more details.`;
			}

			if (subject) {
				await addDocument('notifications', {
					id: `notif_${Date.now()}_${Math.random().toString(36).substring(7)}`,
					recipientEmail: company.companyEmail,
					recipientRole: 'company',
					subject,
					body,
					date: new Date().toISOString(),
					read: false
				});
			}
		}

		return { success: true };
	}
};
