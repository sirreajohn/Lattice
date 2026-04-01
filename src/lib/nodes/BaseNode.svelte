<script>
	import { canvasState } from '$lib/state/canvas.svelte.js';
	import { nodesState } from '$lib/state/nodes.svelte.js';
	import NoteNode from './NoteNode.svelte';
	import BoardNode from './BoardNode.svelte';

	let { node } = $props();

	function handlePointerDown(e) {
		if (e.button !== 0) return;
		if (['INPUT', 'TEXTAREA', 'BUTTON', 'A'].includes(e.target.tagName)) return;
		
		e.stopPropagation();
		nodesState.selectedNodeId = node.id;

		const startX = e.clientX;
		const startY = e.clientY;
		const initialNodeX = node.x;
		const initialNodeY = node.y;

		function handlePointerMove(ev) {
			const dx = (ev.clientX - startX) / canvasState.scale;
			const dy = (ev.clientY - startY) / canvasState.scale;
			nodesState.updateNodePosition(node.id, initialNodeX + dx, initialNodeY + dy);
		}

		function handlePointerUp() {
			window.removeEventListener('pointermove', handlePointerMove);
			window.removeEventListener('pointerup', handlePointerUp);
		}

		window.addEventListener('pointermove', handlePointerMove);
		window.addEventListener('pointerup', handlePointerUp);
	}

	const typeConfig = {
		note: NoteNode,
		board: BoardNode,
	};

	let NodeComponent = $derived(typeConfig[node.type]);
</script>

<!-- svelte-ignore a11y_interactive_supports_focus -->
<div
	class="absolute bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md shadow-lg shadow-black/50 transition-shadow outline-none {nodesState.selectedNodeId === node.id ? 'ring-1 ring-[var(--color-accent)] z-10' : 'z-0'}"
	style="
		transform: translate({node.x}px, {node.y}px);
		width: {node.width}px;
		height: {node.height === 'auto' ? 'auto' : node.height + 'px'};
	"
	onpointerdown={handlePointerDown}
	role="button"
>
	{#if NodeComponent}
		<NodeComponent {node} />
	{:else}
		<div class="p-4 text-red-500">Unknown node type: {node.type}</div>
	{/if}
</div>
