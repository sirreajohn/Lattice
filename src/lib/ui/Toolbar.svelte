<script>
	import { nodesState } from '$lib/state/nodes.svelte.js';
	import { canvasState } from '$lib/state/canvas.svelte.js';

	function addNote() {
		const screenCenter = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
		const canvasCenter = canvasState.screenToCanvas(screenCenter.x, screenCenter.y);
		nodesState.addNode('note', canvasCenter.x - 125, canvasCenter.y - 75, { text: '' });
	}

	function addBoard() {
		const screenCenter = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
		const canvasCenter = canvasState.screenToCanvas(screenCenter.x, screenCenter.y);
		nodesState.addNode('board', canvasCenter.x - 125, canvasCenter.y - 75, { title: '' });
	}

	function clearBoard() {
		if (confirm("Clear all items?")) {
			nodesState.nodes = [];
			nodesState.connections = [];
			nodesState.saveToStorage();
		}
	}
</script>

<div class="absolute bottom-8 left-1/2 -translate-x-1/2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl py-2 px-4 shadow-2xl flex gap-4 items-center z-50">
	<button 
		onclick={addNote}
		class="text-sm font-mono cursor-pointer font-medium hover:text-white text-[var(--color-text-secondary)] transition-colors px-3 py-1.5 rounded-md hover:bg-neutral-800"
	>
		+ Note
	</button>
	<button 
		onclick={addBoard}
		class="text-sm font-mono cursor-pointer font-medium hover:text-white text-[var(--color-text-secondary)] transition-colors px-3 py-1.5 rounded-md hover:bg-neutral-800"
	>
		+ Board
	</button>
	<div class="h-4 w-px bg-[var(--color-border)]"></div>
	<button 
		onclick={clearBoard}
		class="text-sm font-mono cursor-pointer font-medium hover:text-red-400 text-neutral-500 transition-colors px-3 py-1.5 rounded-md hover:bg-neutral-800"
	>
		Clear
	</button>
</div>
