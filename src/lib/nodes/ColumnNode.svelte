<script>
	import { nodesState } from '$lib/state/nodes.svelte.js';
	import BaseNode from './BaseNode.svelte';
	import { marked } from 'marked';
	import DOMPurify from 'isomorphic-dompurify';

	let { node } = $props();
	let isEditing = $state(false);
	let element = $state();

	function handleInput(e) {
		nodesState.updateNodeData(node.id, { title: e.target.value });
	}

	function startEditing(e) {
		e.stopPropagation();
		isEditing = true;
		setTimeout(() => { if (element) element.focus(); }, 0);
	}

	let children = $derived(nodesState.nodes.filter(n => n.parentId === node.id));
	
	let renderedTitle = $derived(
		node.data.title 
			? DOMPurify.sanitize(marked.parseInline(node.data.title)) 
			: '<span class="opacity-50 text-[var(--color-text-secondary)]">Untitled Deck</span>'
	);
</script>

<div class="flex flex-col w-full h-full outline-none lattice-deck" data-column-id={node.id}>
	<!-- Title Bar -->
	<div class="h-8 w-full border-b border-[var(--color-border)]/30 flex items-center px-3 mb-1">
		{#if isEditing}
			<input 
				bind:this={element}
				class="flex-1 min-w-10 bg-transparent text-xs uppercase tracking-wider font-mono font-semibold text-[var(--color-text-primary)] focus:outline-none"
				value={node.data.title || ''}
				oninput={handleInput}
				onblur={() => (isEditing = false)}
				onkeydown={(e) => { if (e.key === 'Enter') isEditing = false; }}
				placeholder="Deck Name"
			/>
		{:else}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div 
				class="flex-1 text-xs uppercase tracking-wider font-mono font-semibold text-[var(--color-text-primary)] markdown-inline cursor-text"
				onclick={startEditing}
			>
				{@html renderedTitle}
			</div>
		{/if}
	</div>
	
	<!-- Children container -->
	<div class="flex-1 p-2 flex flex-col gap-2 overflow-y-auto min-h-[100px] pointer-events-none">
		<div class="flex flex-col gap-2 pointer-events-auto w-full h-full min-h-[50px]">
			{#each children as child (child.id)}
				<div class="relative w-full shrink-0">
					<BaseNode node={child} />
				</div>
			{/each}
			{#if children.length === 0}
				<div class="text-[10px] text-[var(--color-text-secondary)] font-mono text-center mt-4 uppercase tracking-widest opacity-50">Drop cards here</div>
			{/if}
		</div>
	</div>
</div>
