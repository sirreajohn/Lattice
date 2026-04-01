<script>
	import { nodesState } from '$lib/state/nodes.svelte.js';
	
	let { node } = $props();
	
	function handleInput(e) {
		nodesState.updateNodeData(node.id, { text: e.target.value });
	}
</script>

<div class="flex flex-col h-full w-full">
	<!-- Drag handle / Header -->
	<div class="h-6 w-full cursor-grab active:cursor-grabbing border-b border-[var(--color-border)] opacity-20 hover:opacity-100 flex items-center px-2">
		<div class="w-full flex space-x-1">
			<div class="w-1.5 h-1.5 rounded-full bg-[var(--color-text-secondary)]"></div>
			<div class="w-1.5 h-1.5 rounded-full bg-[var(--color-text-secondary)]"></div>
			<div class="w-1.5 h-1.5 rounded-full bg-[var(--color-text-secondary)]"></div>
		</div>
	</div>
	
	<!-- Editable Content -->
	<textarea 
		class="w-full min-h-[100px] resize-y bg-transparent p-3 text-sm font-mono text-[var(--color-text-primary)] focus:outline-none focus:ring-0 rounded-b-md"
		value={node.data.text || ''}
		oninput={handleInput}
		placeholder="Empty note..."
	></textarea>
</div>
