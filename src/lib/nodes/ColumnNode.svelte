<script>
	import { nodesState } from '$lib/state/nodes.svelte.js';
	import BaseNode from './BaseNode.svelte';

	let { node } = $props();

	function handleInput(e) {
		nodesState.updateNodeData(node.id, { title: e.target.value });
	}

	let children = $derived(nodesState.nodes.filter(n => n.parentId === node.id));
</script>

<div class="flex flex-col w-full h-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md outline-none lattice-deck" data-column-id={node.id}>
	<!-- Header -->
	<div class="h-8 w-full cursor-grab active:cursor-grabbing border-b border-[var(--color-border)] opacity-60 hover:opacity-100 flex items-center px-3 bg-[#111]">
		<span class="text-xs uppercase tracking-wider font-mono text-[var(--color-text-secondary)] font-semibold">Deck</span>
	</div>
	
	<!-- Deck Title -->
	<div class="p-3 pb-0">
		<input 
			class="w-full bg-transparent text-sm font-mono font-bold text-[var(--color-text-primary)] focus:outline-none focus:ring-0 truncate"
			value={node.data.title || 'Untitled Deck'}
			oninput={handleInput}
			placeholder="Deck Name"
		/>
	</div>
	
	<!-- Children container -->
	<div class="flex-1 p-2 flex flex-col gap-2 overflow-y-auto min-h-[100px] pointer-events-none">
		<!-- pointer-events-none here to let drop detection hit the lattice-deck wrapper cleanly -->
		<div class="flex flex-col gap-2 pointer-events-auto w-full h-full min-h-[50px]">
			{#each children as child (child.id)}
				<div class="relative w-full shrink-0">
					<BaseNode node={child} />
				</div>
			{/each}
			{#if children.length === 0}
				<div class="text-[10px] text-[var(--color-text-secondary)] font-mono text-center mt-4">Drop cards here</div>
			{/if}
		</div>
	</div>
</div>
