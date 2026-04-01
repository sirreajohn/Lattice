<script>
	import { canvasState } from '$lib/state/canvas.svelte.js';
	import { nodesState } from '$lib/state/nodes.svelte.js';
	import NoteNode from './NoteNode.svelte';
	import BoardNode from './BoardNode.svelte';
	import ColumnNode from './ColumnNode.svelte';

	let { node } = $props();

	let baseElement;
	let isNested = $derived(!!node.parentId);

	function handlePointerDown(e) {
		if (e.button !== 0) return;
		if (['INPUT', 'TEXTAREA', 'BUTTON', 'A'].includes(e.target.tagName)) return;
		
		e.stopPropagation();
		nodesState.selectedNodeId = node.id;

		// Pop Logic - instantly break out of deck to follow pointer
		if (node.parentId) {
			if (baseElement) {
				const rect = baseElement.getBoundingClientRect();
				const canvasPos = canvasState.screenToCanvas(rect.left, rect.top);
				nodesState.updateNodePosition(node.id, canvasPos.x, canvasPos.y);
			}
			nodesState.updateNodeParent(node.id, null);
		}

		const startX = e.clientX;
		const startY = e.clientY;
		const initialNodeX = node.x;
		const initialNodeY = node.y;

		function handlePointerMove(ev) {
			const dx = (ev.clientX - startX) / canvasState.scale;
			const dy = (ev.clientY - startY) / canvasState.scale;
			nodesState.updateNodePosition(node.id, initialNodeX + dx, initialNodeY + dy);
		}

		function handlePointerUp(ev) {
			window.removeEventListener('pointermove', handlePointerMove);
			window.removeEventListener('pointerup', handlePointerUp);

			// Snapping into a Deck
			if (node.type !== 'column') {
				const elements = document.elementsFromPoint(ev.clientX, ev.clientY);
				const deckElement = elements.find(el => el.classList.contains('lattice-deck'));
				
				if (deckElement) {
					const deckId = deckElement.getAttribute('data-column-id');
					if (deckId !== node.id) {
						nodesState.updateNodeParent(node.id, deckId);
					}
				}
			}
		}

		window.addEventListener('pointermove', handlePointerMove);
		window.addEventListener('pointerup', handlePointerUp);
	}

	function handleAnchorPointerDown(e) {
		e.stopPropagation();
		const startCanvasPos = canvasState.screenToCanvas(e.clientX, e.clientY);
		nodesState.draftConnection = { fromId: node.id, endX: startCanvasPos.x, endY: startCanvasPos.y };

		function move(ev) {
			const currentCanvasPos = canvasState.screenToCanvas(ev.clientX, ev.clientY);
			nodesState.draftConnection = { ...nodesState.draftConnection, endX: currentCanvasPos.x, endY: currentCanvasPos.y };
		}

		function up(ev) {
			window.removeEventListener('pointermove', move);
			window.removeEventListener('pointerup', up);
			
			// Detect drop onto another base node container
			const elements = document.elementsFromPoint(ev.clientX, ev.clientY);
			const targetNodeEl = elements.find(el => el.hasAttribute('data-node-id'));
			
			if (targetNodeEl) {
				const toId = targetNodeEl.getAttribute('data-node-id');
				if (toId && toId !== node.id) {
					nodesState.addConnection(node.id, toId);
				}
			}
			nodesState.draftConnection = null;
		}

		window.addEventListener('pointermove', move);
		window.addEventListener('pointerup', up);
	}

	const typeConfig = {
		note: NoteNode,
		board: BoardNode,
		column: ColumnNode,
	};

	let NodeComponent = $derived(typeConfig[node.type]);
</script>

<!-- svelte-ignore a11y_interactive_supports_focus -->
<div
	bind:this={baseElement}
	data-node-id={node.id}
	class="group bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md shadow-lg shadow-black/50 transition-shadow outline-none {nodesState.selectedNodeId === node.id ? 'ring-1 ring-[var(--color-accent)] z-20' : 'z-10'} {isNested ? 'relative' : 'absolute'}"
	style="
		{isNested ? '' : `transform: translate(${node.x}px, ${node.y}px);`} 
		width: {isNested ? '100%' : node.width + 'px'}; 
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

	<!-- Connection Anchor UI -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div 
		class="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-[var(--color-border)] rounded-full cursor-crosshair hover:scale-125 hover:bg-[var(--color-accent)] transition-all shadow border border-[var(--color-surface)] z-10"
		onpointerdown={handleAnchorPointerDown}
	></div>

	<!-- Delete Button (Visible on Hover) -->
	<button 
		class="absolute -top-2 -right-2 w-5 h-5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full text-[var(--color-text-secondary)] hover:text-red-400 hover:border-red-400 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 z-30 shadow"
		onclick={(e) => { e.stopPropagation(); nodesState.removeNode(node.id); }}
		title="Delete node"
	>
		<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
	</button>
</div>
