<script>
	import { nodesState } from '$lib/state/nodes.svelte.js';
	
	let { node } = $props();

	function handleInput(e) {
		nodesState.updateNodeData(node.id, { title: e.target.value });
	}

	function navigateToBoard(e) {
		e.stopPropagation();
		window.location.href = `/b/${node.id}`;
	}
</script>

<div class="flex flex-col h-full w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md overflow-hidden hover:border-[var(--color-accent)] transition-colors" ondblclick={navigateToBoard}>
	<!-- Drag handle / Header -->
	<div class="h-8 w-full cursor-grab active:cursor-grabbing border-b border-[var(--color-border)] opacity-60 hover:opacity-100 flex items-center justify-between px-3 bg-[#111]">
		<div class="flex space-x-1.5 items-center">
			<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-[var(--color-text-secondary)]"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
			<span class="text-xs uppercase tracking-wider font-mono text-[var(--color-text-secondary)] font-semibold">Board</span>
		</div>
	</div>
	
	<div class="p-4 flex-1 flex flex-col justify-between group">
		<input 
			class="w-full bg-transparent text-lg font-mono font-bold text-[var(--color-text-primary)] focus:outline-none focus:ring-0 truncate"
			value={node.data.title || 'Untitled Board'}
			oninput={handleInput}
			placeholder="Board Title"
		/>
		<p class="text-[10px] text-[var(--color-text-secondary)] mt-2 font-mono opacity-50">Double click to enter</p>
		
		<button 
			onclick={navigateToBoard}
			onpointerdown={(e) => e.stopPropagation()}
			class="mt-4 self-end bg-[var(--color-border)] hover:bg-[var(--color-accent)] text-white text-xs px-3 py-1.5 rounded transition-colors opacity-0 group-hover:opacity-100 font-mono"
		>
			Enter &rarr;
		</button>
	</div>
</div>
