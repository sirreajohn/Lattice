<script>
	import { page } from '$app/stores';
	import Canvas from '$lib/canvas/Canvas.svelte';
	import Toolbar from '$lib/ui/Toolbar.svelte';
	import { nodesState } from '$lib/state/nodes.svelte.js';

	$effect(() => {
		const boardId = $page.params.id;
		if (boardId && nodesState.boardId !== boardId) {
			nodesState.boardId = boardId;
			nodesState.nodes.length = 0;
			nodesState.connections.length = 0;
			nodesState.selectedNodeId = null;
			nodesState.loadFromStorage();
		}
	});
</script>

<svelte:head>
	<title>Board: {$page.params.id}</title>
</svelte:head>

<Canvas>
	<Toolbar />
</Canvas>
