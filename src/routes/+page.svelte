<script>
	import Canvas from '$lib/canvas/Canvas.svelte';
	import Toolbar from '$lib/ui/Toolbar.svelte';
	import { nodesState } from '$lib/state/nodes.svelte.js';

	$effect(() => {
		if (nodesState.boardId !== 'default') {
			nodesState.boardId = 'default';
			nodesState.nodes.length = 0;
			nodesState.connections.length = 0;
			nodesState.selectedNodeId = null;
			nodesState.loadFromStorage();
		}
	});
</script>

<svelte:head>
	<title>Lattice Workspace</title>
</svelte:head>

<Canvas>
	<Toolbar />
</Canvas>
