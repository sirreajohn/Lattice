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

	function addDeck() {
		const screenCenter = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
		const canvasCenter = canvasState.screenToCanvas(screenCenter.x, screenCenter.y);
		nodesState.addNode('column', canvasCenter.x - 125, canvasCenter.y - 75, { title: '' });
	}

	function clearBoard() {
		if (confirm("Clear all items?")) {
			nodesState.nodes = [];
			nodesState.connections = [];
			nodesState.saveToStorage();
		}
	}
</script>

<div class="absolute bottom-8 left-1/2 -translate-x-1/2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl py-2 px-3 shadow-2xl flex gap-3 items-center z-50">
	<button 
		onclick={addNote}
		class="group relative flex items-center justify-center w-8 h-8 text-[var(--color-text-secondary)] hover:text-white hover:bg-neutral-800 rounded-md transition-colors"
	>
		<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
		<span class="absolute bottom-full mb-3 opacity-0 group-hover:opacity-100 bg-[#000] border border-[var(--color-border)] text-white text-[10px] uppercase font-bold tracking-wider rounded px-2 py-1 whitespace-nowrap pointer-events-none transition-opacity">Note</span>
	</button>

	<button 
		onclick={addDeck}
		class="group relative flex items-center justify-center w-8 h-8 text-[var(--color-text-secondary)] hover:text-white hover:bg-neutral-800 rounded-md transition-colors"
	>
		<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/></svg>
		<span class="absolute bottom-full mb-3 opacity-0 group-hover:opacity-100 bg-[#000] border border-[var(--color-border)] text-white text-[10px] uppercase font-bold tracking-wider rounded px-2 py-1 whitespace-nowrap pointer-events-none transition-opacity">Deck</span>
	</button>

	<button 
		onclick={addBoard}
		class="group relative flex items-center justify-center w-8 h-8 text-[var(--color-text-secondary)] hover:text-white hover:bg-neutral-800 rounded-md transition-colors"
	>
		<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
		<span class="absolute bottom-full mb-3 opacity-0 group-hover:opacity-100 bg-[#000] border border-[var(--color-border)] text-white text-[10px] uppercase font-bold tracking-wider rounded px-2 py-1 whitespace-nowrap pointer-events-none transition-opacity">Board</span>
	</button>

	<div class="h-5 w-px bg-[var(--color-border)] mx-1"></div>

	<button 
		onclick={clearBoard}
		class="group relative flex items-center justify-center w-8 h-8 text-neutral-500 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
	>
		<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
		<span class="absolute bottom-full mb-3 opacity-0 group-hover:opacity-100 bg-red-950 border border-red-900 text-red-200 text-[10px] uppercase font-bold tracking-wider rounded px-2 py-1 whitespace-nowrap pointer-events-none transition-opacity">Clear All</span>
	</button>
</div>
