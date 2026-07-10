<script>
	let { data } = $props();
	// svelte-ignore state_referenced_locally
	let students = $state([...data.students]);
	
	let searchQuery = $state('');
	let filterTab = $state('All'); // 'All', 'Active', 'Blocked'

	const totalStudents = $derived(students.length);
	const activeAccounts = $derived(students.filter(s => !s.isBlocked).length);
	const blockedAccounts = $derived(students.filter(s => s.isBlocked).length);

	const filteredStudents = $derived(
		students.filter(s => {
			const matchesSearch = s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
								  s.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
								  s.collegeName.toLowerCase().includes(searchQuery.toLowerCase());
			
			if (filterTab === 'Active' && s.isBlocked) return false;
			if (filterTab === 'Blocked' && !s.isBlocked) return false;
			
			return matchesSearch;
		})
	);

	import { enhance } from '$app/forms';
	let loadingId = $state(null);
</script>

<div class="space-y-8">
	<!-- Header -->
	<div>
		<h1 class="text-3xl font-black font-display text-primary tracking-tight">Students Board</h1>
		<p class="text-muted mt-2">Manage and monitor all registered student accounts on the platform.</p>
	</div>

	<!-- Stats Cards -->
	<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
		<div class="glass-card rounded-2xl p-6 border-divider">
			<h3 class="text-xs font-bold text-muted uppercase tracking-wider mb-2">Total Students</h3>
			<p class="text-4xl font-black text-indigo-600 font-display">{totalStudents.toLocaleString()}</p>
		</div>
		<div class="glass-card rounded-2xl p-6 border-divider">
			<h3 class="text-xs font-bold text-muted uppercase tracking-wider mb-2">Active Accounts</h3>
			<p class="text-4xl font-black text-emerald-600 font-display">{activeAccounts.toLocaleString()}</p>
		</div>
		<div class="glass-card rounded-2xl p-6 border-divider">
			<h3 class="text-xs font-bold text-muted uppercase tracking-wider mb-2">Blocked</h3>
			<p class="text-4xl font-black text-rose-600 font-display">{blockedAccounts.toLocaleString()}</p>
		</div>
	</div>

	<!-- Search & Filters -->
	<div class="glass-card rounded-2xl p-4 border-divider flex flex-col md:flex-row gap-4 justify-between items-center">
		<div class="relative w-full md:w-96">
			<svg class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
			<input 
				type="text" 
				bind:value={searchQuery}
				placeholder="Search by name, email, college or department..."
				class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-divider bg-white/50 focus:outline-none focus:border-indigo-500 text-sm transition"
			/>
		</div>
		<div class="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/5">
			{#each ['All', 'Active', 'Blocked'] as tab}
				<button 
					onclick={() => filterTab = tab}
					class="px-4 py-2 rounded-lg text-xs font-bold transition duration-200 cursor-pointer {filterTab === tab ? 'bg-indigo-600 text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700 '}"
				>
					{tab}
				</button>
			{/each}
		</div>
	</div>

	<!-- Data Table -->
	<div class="glass-card rounded-2xl border-divider overflow-hidden">
		<div class="overflow-x-auto">
			<table class="w-full text-left border-collapse">
				<thead>
					<tr class="border-b border-slate-200/50 text-xs font-bold text-muted uppercase tracking-wider bg-slate-50/50">
						<th class="px-6 py-4">Name</th>
						<th class="px-6 py-4">College</th>
						<th class="px-6 py-4">Department</th>
						<th class="px-6 py-4">Status</th>
						<th class="px-6 py-4 text-right">Actions</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-200/50 text-sm">
					{#each filteredStudents.slice(0, 50) as student}
						<tr class="hover:bg-slate-50/50 transition">
							<td class="px-6 py-4">
								<div class="font-bold text-primary">{student.fullName}</div>
								<div class="text-xs text-muted">{student.email}</div>
							</td>
							<td class="px-6 py-4 text-slate-600">{student.collegeName}</td>
							<td class="px-6 py-4 text-slate-600">{student.department}</td>
							<td class="px-6 py-4">
								{#if student.isBlocked}
									<span class="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20">Blocked</span>
								{:else}
									<span class="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Active</span>
								{/if}
							</td>
							<td class="px-6 py-4 text-right">
								<div class="flex items-center justify-end gap-2">
									<form method="POST" action="?/toggleBlock" use:enhance={() => {
										loadingId = student.id + '-block';
										return async ({ update }) => {
											loadingId = null;
											update({ reset: false });
										};
									}}>
										<input type="hidden" name="studentId" value={student.id} />
										<button 
											disabled={loadingId !== null}
											class="text-xs font-bold px-3 py-1.5 rounded-lg text-amber-500 hover:bg-amber-500/10 transition cursor-pointer disabled:opacity-50"
										>
											{#if loadingId === student.id + '-block'}
												<span class="h-3 w-3 border-2 border-amber-300 border-t-amber-500 rounded-full animate-spin inline-block align-middle mr-1"></span>
											{/if}
											{student.isBlocked ? 'Unblock' : 'Block'}
										</button>
									</form>
									
									<form method="POST" action="?/deleteStudent" use:enhance={({ cancel }) => {
										if(!confirm('Are you sure you want to delete this student?')) cancel();
										loadingId = student.id + '-delete';
										return async ({ update }) => {
											loadingId = null;
											update({ reset: false });
										};
									}}>
										<input type="hidden" name="studentId" value={student.id} />
										<button 
											disabled={loadingId !== null}
											class="text-xs font-bold px-3 py-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition cursor-pointer disabled:opacity-50"
										>
											{#if loadingId === student.id + '-delete'}
												<span class="h-3 w-3 border-2 border-rose-300 border-t-rose-500 rounded-full animate-spin inline-block align-middle mr-1"></span>
											{/if}
											Delete
										</button>
									</form>
								</div>
							</td>
						</tr>
					{/each}
					{#if filteredStudents.length === 0}
						<tr>
							<td colspan="5" class="px-6 py-12 text-center text-muted">
								No students found matching your criteria.
							</td>
						</tr>
					{/if}
				</tbody>
			</table>
		</div>
	</div>
</div>
