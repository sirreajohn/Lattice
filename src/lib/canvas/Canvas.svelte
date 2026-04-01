<script>
	import { canvasState } from '$lib/state/canvas.svelte.js';
	import { nodesState } from '$lib/state/nodes.svelte.js';
	import ConnectionLines from './ConnectionLines.svelte';
	import BaseNode from '../nodes/BaseNode.svelte';

	let { children } = $props();
	let canvasElement;

	function handlePointerDown(e) {
		if (e.button === 1 || (e.button === 0 && e.altKey)) {
			e.preventDefault();
			const startX = e.clientX;
			const startY = e.clientY;
			const initialCanvasX = canvasState.x;
			const initialCanvasY = canvasState.y;

			function handlePointerMove(ev) {
				canvasState.x = initialCanvasX + (ev.clientX - startX);
				canvasState.y = initialCanvasY + (ev.clientY - startY);
			}

			function handlePointerUp() {
				window.removeEventListener('pointermove', handlePointerMove);
				window.removeEventListener('pointerup', handlePointerUp);
			}

			window.addEventListener('pointermove', handlePointerMove);
			window.addEventListener('pointerup', handlePointerUp);
		} else if (e.target === canvasElement) {
			nodesState.selectedNodeId = null;
		}
	}

	function handleWheel(e) {
		e.preventDefault();
		if (e.ctrlKey || e.metaKey) {
			canvasState.zoom(e.deltaY, e.clientX, e.clientY);
		} else {
			canvasState.pan(-e.deltaX, -e.deltaY);
		}
	}
</script>

<main
	bind:this={canvasElement}
	onpointerdown={handlePointerDown}
	onwheel={handleWheel}
	class="w-full h-screen relative overflow-hidden text-[var(--color-text-primary)]"
>
	<div 
		class="absolute inset-0 pointer-events-none opacity-20"
		style="
			background-position: {canvasState.x}px {canvasState.y}px; 
			background-size: {canvasState.scale * 40}px {canvasState.scale * 40}px; 
			background-image: radial-gradient(var(--color-border) 1px, transparent 1px);
		"
	></div>

	<div
		class="absolute top-0 left-0 origin-top-left will-change-transform w-0 h-0"
		style="transform: translate({canvasState.x}px, {canvasState.y}px) scale({canvasState.scale})"
	>
		<ConnectionLines />
		{#each nodesState.nodes as node (node.id)}
			<BaseNode {node} />
		{/each}
	</div>
	
	{#if children}
		{@render children()}
	{/if}
</main>
