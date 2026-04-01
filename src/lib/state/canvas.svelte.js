export class CanvasState {
	x = $state(0);
	y = $state(0);
	scale = $state(1);

	constructor() {}

	pan(dx, dy) {
		this.x += dx;
		this.y += dy;
	}

	zoom(delta, mouseX, mouseY) {
		const scaleFactor = 1.05;
		const previousScale = this.scale;

		if (delta > 0) {
			this.scale /= scaleFactor;
		} else {
			this.scale *= scaleFactor;
		}

		// Clamp scale between 0.1 and 5
		this.scale = Math.max(0.1, Math.min(this.scale, 5));

		// Adjust x and y so that the point under the mouse remains the same
		const scaleRatio = this.scale / previousScale;
		this.x = mouseX - (mouseX - this.x) * scaleRatio;
		this.y = mouseY - (mouseY - this.y) * scaleRatio;
	}

	screenToCanvas(screenX, screenY) {
		return {
			x: (screenX - this.x) / this.scale,
			y: (screenY - this.y) / this.scale
		};
	}

	canvasToScreen(canvasX, canvasY) {
		return {
			x: canvasX * this.scale + this.x,
			y: canvasY * this.scale + this.y
		};
	}
}

export const canvasState = new CanvasState();
