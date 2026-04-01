<script>
	import { nodesState } from '$lib/state/nodes.svelte.js';

	// Helper to find center of a node
	function getNodeCenter(id) {
		const node = nodesState.nodes.find(n => n.id === id);
		if (!node) return null;
		// Hardcoded width and approx height for now; a real app would measure via bind:clientWidth/Height
		// For MVP, assume width 250 and approx center
		const w = node.width || 250;
		const h = 150; // estimate
		return { x: node.x + w / 2, y: node.y + h / 2 };
	}
</script>

<svg class="absolute top-0 left-0 w-0 h-0 overflow-visible pointer-events-none">
	<defs>
		<marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
			<polygon points="0 0, 10 3.5, 0 7" fill="var(--color-border)" />
		</marker>
	</defs>

	{#each nodesState.connections as conn (conn.id)}
		{@const fromCenter = getNodeCenter(conn.from)}
		{@const toCenter = getNodeCenter(conn.to)}
		
		{#if fromCenter && toCenter}
			<path 
				d="M {fromCenter.x} {fromCenter.y} L {toCenter.x} {toCenter.y}"
				stroke="var(--color-border)"
				stroke-width="2"
				fill="none"
				marker-end="url(#arrowhead)"
			/>
		{/if}
	{/each}
</svg>
