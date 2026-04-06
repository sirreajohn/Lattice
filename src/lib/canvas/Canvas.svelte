<script lang="js">
	import { canvasState } from "$lib/state/canvas.svelte.js";
	import { nodesState } from "$lib/state/nodes.svelte.js";
	import BaseNode from "$lib/nodes/BaseNode.svelte";
	import ConnectionLines from "./ConnectionLines.svelte";

	let { children } = $props();
	let canvasElement;

	function handlePointerDown(e) {
		nodesState.selectedNodeId = null;
		
		if (e.button === 0 || e.button === 1 || e.altKey) {
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
				window.removeEventListener("pointermove", handlePointerMove);
				window.removeEventListener("pointerup", handlePointerUp);
			}

			window.addEventListener("pointermove", handlePointerMove);
			window.addEventListener("pointerup", handlePointerUp);
		}
	}

	function handleWheel(e) {
		if (!e.ctrlKey && !e.metaKey) {
			canvasState.x -= e.deltaX;
			canvasState.y -= e.deltaY;
			return;
		}

		e.preventDefault();
		const zoomFactor = 1.05;
		const direction = e.deltaY > 0 ? -1 : 1;
		const scaleChange = direction > 0 ? zoomFactor : 1 / zoomFactor;

		const rect = canvasElement.getBoundingClientRect();
		const mouseX = e.clientX - rect.left;
		const mouseY = e.clientY - rect.top;

		const newScale = Math.min(
			Math.max(canvasState.scale * scaleChange, 0.1),
			5,
		);
		const actualScaleChange = newScale / canvasState.scale;

		canvasState.x = mouseX - (mouseX - canvasState.x) * actualScaleChange;
		canvasState.y = mouseY - (mouseY - canvasState.y) * actualScaleChange;
		canvasState.scale = newScale;
	}
</script>

<div
	bind:this={canvasElement}
	onpointerdown={handlePointerDown}
	onwheel={handleWheel}
	class="w-full h-screen relative overflow-hidden text-[var(--color-text-primary)] bg-[var(--color-canvas)] select-none touch-none"
	style="
		background-image: radial-gradient(var(--color-border) 1.5px, transparent 1.5px);
		background-position: {canvasState.x}px {canvasState.y}px;
		background-size: {30 * canvasState.scale}px {30 * canvasState.scale}px;
	"
>
	<div
		class="absolute top-0 left-0 w-0 h-0 overflow-visible origin-top-left"
		style="transform: translate({canvasState.x}px, {canvasState.y}px) scale({canvasState.scale})"
	>
		<ConnectionLines />
		{#each nodesState.nodes.filter((n) => !n.parentId) as node (node.id)}
			<BaseNode {node} />
		{/each}
	</div>

	{#if children}
		{@render children()}
	{/if}
</div>
