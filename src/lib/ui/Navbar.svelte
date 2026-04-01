<script>
	import { page } from '$app/stores';

	// Derived state to check if we are inside a board or at the root
	let isNestedBoard = $derived(!!$page.params.id);
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
				<span class="truncate max-w-[200px] text-[var(--color-text-primary)]" title={$page.params.id}>
					board_{$page.params.id.split('-')[0]}
				</span>
				
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
			<div class="w-1.5 h-1.5 rounded-full bg-green-500/80 shadow-[0_0_4px_rgba(34,197,94,0.8)]"></div>
			<span>Local</span>
		</div>
	</div>
</header>
