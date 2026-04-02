<script>
	import { page } from '$app/stores';
	import { globalMetadata, nodesState } from '$lib/state/nodes.svelte.js';
	import { authState } from '$lib/state/auth.svelte.js';
	import { env } from '$env/dynamic/public';
	
	const STORAGE_MODE = env.PUBLIC_STORAGE_MODE || 'local';

	// Derived state to check if we are inside a board or at the root
	let isNestedBoard = $derived(!!$page.params.id);
	let boardId = $derived($page.params.id);
	
	let isEditingBoardName = $state(false);
	let nameInputElement = $state();
	let isUserMenuOpen = $state(false);

	function handleNameInput(e) {
		globalMetadata.setName(boardId, e.target.value);
	}
	
	function startEditingName() {
		isEditingBoardName = true;
		setTimeout(() => { if (nameInputElement) nameInputElement.focus(); }, 0);
	}
</script>

<header class="absolute top-0 left-0 w-full h-12 border-b border-[var(--color-border)] bg-[var(--color-canvas)]/80 backdrop-blur-md z-50 flex items-center px-4 justify-between select-none">
	<div class="flex items-center gap-4">
		<!-- Logo -->
		<a href="/" data-sveltekit-reload class="flex items-center gap-2 hover:opacity-80 transition-opacity">
			<div class="w-5 h-5 bg-[var(--color-text-primary)] rounded-sm flex items-center justify-center">
				<span class="text-[var(--color-canvas)] font-bold text-[10px] font-mono">L</span>
			</div>
			<span class="font-mono font-bold text-xs tracking-widest uppercase text-[var(--color-text-primary)]">Lattice</span>
		</a>

		<!-- Path / Breadcrumbs -->
		{#if isNestedBoard}
			<div class="flex items-center gap-2 text-[var(--color-text-secondary)] font-mono text-xs">
				<span class="opacity-50">/</span>
				
				{#if isEditingBoardName}
					<input 
						bind:this={nameInputElement}
						class="bg-transparent text-[var(--color-text-primary)] focus:outline-none w-32 font-bold border-b border-[var(--color-accent)]"
						value={globalMetadata.getName(boardId).startsWith('board_') ? '' : globalMetadata.getName(boardId)}
						oninput={handleNameInput}
						onblur={() => (isEditingBoardName = false)}
						onkeydown={(e) => { if (e.key === 'Enter') isEditingBoardName = false; }}
						placeholder="Board Name"
					/>
				{:else}
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<span 
						class="truncate max-w-[200px] text-[var(--color-text-primary)] cursor-pointer hover:underline hover:text-[var(--color-accent)] transition-colors" 
						title="Click to rename board"
						onclick={startEditingName}
					>
						{globalMetadata.getName(boardId)}
					</span>
				{/if}
				
				<!-- Back to workspace button -->
				<a href="/" data-sveltekit-reload class="ml-2 hover:text-[var(--color-text-primary)] flex items-center gap-1 bg-[var(--color-surface)] border border-[var(--color-border)] px-2 py-0.5 rounded transition-colors text-[10px]">
					&larr; Exit
				</a>
			</div>
		{/if}
	</div>
	
	<div class="flex items-center gap-4 text-xs font-mono text-[var(--color-text-secondary)]">
		<!-- Status indicator -->
		<div class="flex items-center gap-2 px-2 py-1 rounded bg-[var(--color-surface)] border border-[var(--color-border)]">
			{#if STORAGE_MODE === 'local'}
				<!-- Hide sync status in local mode -->
				<div class="w-1.5 h-1.5 rounded-full bg-slate-500 shadow-[0_0_4px_rgba(100,116,139,0.8)]"></div>
				<span class="text-slate-500">Local Only</span>
			{:else if !authState.currentUser && authState.initialized}
				<div class="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_4px_rgba(249,115,22,0.8)] animate-pulse"></div>
				<span class="text-orange-500 transition-colors">Temp Session (Data Not Saved)</span>
			{:else}
				{#if nodesState.syncStatus === 'saving'}
					<div class="w-1.5 h-1.5 rounded-full bg-yellow-500 shadow-[0_0_4px_rgba(234,179,8,0.8)] animate-pulse"></div>
					<span class="text-yellow-500 transition-colors">Saving...</span>
				{:else if nodesState.syncStatus === 'error'}
					<div class="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] shadow-[0_0_4px_var(--color-accent)]"></div>
					<span class="text-[var(--color-accent)] transition-colors">Offline</span>
				{:else}
					<div class="w-1.5 h-1.5 rounded-full bg-green-500/80 shadow-[0_0_4px_rgba(34,197,94,0.8)]"></div>
					<span class="transition-colors text-[var(--color-text-secondary)]">Cloud</span>
				{/if}
			{/if}
		</div>

		{#if STORAGE_MODE !== 'local'}
			<div class="h-4 w-px bg-[var(--color-border)] mx-1"></div>
			<!-- Auth integration -->
			{#if !authState.initialized}
				<div class="w-5 h-5 rounded-full bg-[var(--color-border)] animate-pulse"></div>
			{:else if authState.currentUser}
				<div class="relative flex items-center">
					<button 
						onclick={() => isUserMenuOpen = !isUserMenuOpen}
						class="w-6 h-6 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-[var(--color-canvas)] font-bold text-[10px] cursor-pointer hover:ring-2 hover:ring-[var(--color-accent)] hover:ring-offset-1 hover:ring-offset-[var(--color-canvas)] transition-all overflow-hidden relative"
					>
						{#if authState.currentUser?.user_metadata?.avatar_url}
							<img src={authState.currentUser.user_metadata.avatar_url} alt="Avatar" class="w-full h-full object-cover" />
						{:else}
							<span>{authState.currentUser.email?.[0].toUpperCase() || 'U'}</span>
						{/if}
					</button>

					{#if isUserMenuOpen}
						<!-- svelte-ignore a11y_click_events_have_key_events -->
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<!-- Invisible backdrop to catch clicks outside the menu -->
						<div class="fixed inset-0 z-40 cursor-default" onclick={() => isUserMenuOpen = false}></div>
						
						<!-- Dropdown Menu -->
						<div class="absolute top-full right-0 mt-3 w-48 bg-[var(--color-surface)] border border-[var(--color-border)] rounded shadow-xl z-50 flex flex-col py-1 animate-in fade-in slide-in-from-top-2 duration-150">
							<div class="px-3 py-2 border-b border-[var(--color-border)] mb-1">
								<p class="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-wider mb-0.5">Signed in as</p>
								<p class="text-xs truncate text-[var(--color-text-primary)] font-bold">{authState.currentUser.email}</p>
							</div>
							
							<button 
								onclick={() => { authState.signOut(); isUserMenuOpen = false; }}
								class="w-full text-left px-3 py-1.5 text-xs text-red-400 hover:text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-2"
							>
								<svg class="w-3.5 h-3.5" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4m7 14l5-5l-5-5m5 5H9"/></svg>
								Sign Out
							</button>
						</div>
					{/if}
				</div>
			{:else}
				<button 
					onclick={() => authState.signInWithGoogle()}
					class="flex flex-row items-center gap-1.5 px-2 py-1 rounded bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-border)] transition-colors text-[var(--color-text-primary)]"
					title="Sign In with Google"
				>
					<svg class="w-3.5 h-3.5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
					Login
				</button>
			{/if}
		{/if}
	</div>
</header>
