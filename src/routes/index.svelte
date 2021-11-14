<script>
	import { fabric } from 'fabric';
	import { onMount } from 'svelte';

	let _canvasWrapper;
	let _canvasElement;
	let _canvas;

	function resizeCanvas(canvas) {
		const ratio = canvas.getWidth() / canvas.getHeight();
		const containerWidth = _canvasWrapper.clientWidth;
		const containerHeight = _canvasWrapper.clientHeight;

		const scale = containerWidth / canvas.getWidth();
		const zoom = canvas.getZoom() * scale;

		canvas.setDimensions({ width: containerWidth, height: containerWidth / ratio });
		canvas.setViewportTransform([zoom, 0, 0, zoom, 0, 0]);
	}

	function initCanvas(canvas) {
		resizeCanvas(canvas);

		let mapSize = {};
		let mapImg = fabric.Image.fromURL('fort_everfall.png', (image) => {
			canvas.setZoom(1); // reset zoom so pan actions work as expected
			let zoom = 1;
			let vpw = canvas.width / zoom;
			let vph = canvas.height / zoom;
			let x = image.left - vpw / 2; // x is the location where the top left of the viewport should be
			let y = image.top - vph / 2; // y idem
			canvas.absolutePan({ x: x, y: y });
			canvas.setZoom(zoom);
			canvas.add(image);
			image.set('selectable', false);
			mapSize = image.getOriginalSize();

			canvas.viewportCenterObjectH(image);
			canvas.viewportCenterObjectV(image);
		});

		canvas.on('mouse:wheel', function (opt) {
			const delta = opt.e.deltaY;
			let zoom = canvas.getZoom();
			zoom *= 0.999 ** delta;
			if (zoom > 20) zoom = 20;
			if (zoom < 0.5) zoom = 0.5;
			canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
			opt.e.preventDefault();
			opt.e.stopPropagation();

			/*
			const vpt = this.viewportTransform;
			if (vpt[4] >= 0) {
				this.viewportTransform[4] = 0;
			} else if (vpt[4] < canvas.getWidth() - mapSize.width * zoom) {
				this.viewportTransform[4] = canvas.getWidth() - mapSize.width * zoom;
			}
			if (vpt[5] >= 0) {
				this.viewportTransform[5] = 0;
			} else if (vpt[5] < canvas.getHeight() - mapSize.height * zoom) {
				this.viewportTransform[5] = canvas.getHeight() - mapSize.height * zoom;
			}
			 */
		});

		canvas.on('mouse:down', function (opt) {
			const evt = opt.e;
			if (evt.altKey === true || evt.button === 2) {
				this.isDragging = true;
				this.selection = false;
				this.lastPosX = evt.clientX;
				this.lastPosY = evt.clientY;
			}
		});
		canvas.on('mouse:move', function (opt) {
			if (this.isDragging) {
				const e = opt.e;
				let vpt = this.viewportTransform;
				vpt[4] += e.clientX - this.lastPosX;
				vpt[5] += e.clientY - this.lastPosY;
				this.requestRenderAll();
				this.lastPosX = e.clientX;
				this.lastPosY = e.clientY;
			}
		});
		canvas.on('mouse:up', function (opt) {
			// on mouse up we want to recalculate new interaction
			// for all objects, so we call setViewportTransform
			this.setViewportTransform(this.viewportTransform);
			this.isDragging = false;
			this.selection = true;
		});
	}

	onMount(() => {
		_canvas = new fabric.Canvas(_canvasElement, {
			fireRightClick: true,
			fireMiddleClick: true
		});
		initCanvas(_canvas);
	});
</script>

<svelte:window on:resize={resizeCanvas(_canvas)} />

<div id="canvas-wrapper" bind:this={_canvasWrapper}>
	<canvas id="canvas" bind:this={_canvasElement} />
</div>

<style>
	#canvas-wrapper {
		background-color: peachpuff;
	}
</style>
