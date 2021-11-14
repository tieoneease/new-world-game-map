<script lang="ts">
	import { fabric } from 'fabric';
	import { onMount } from 'svelte';

	let _canvasWrapper;
	let _canvasElement;
	let _canvas;

	interface MarkerConfig {
		name: Marker;
		x: number;
		y: number;
		scaleWidth?: number;
		scaleHeight?: number;
	}

	interface MapData {
		mapImage: string;
		markers: MarkerConfig[];
	}

	enum Territory {
		Everfall
	}

	enum Marker {
		PointA = 'marker_pointA.png',
		PointB = 'marker_pointB.png',
		PointC = 'marker_pointC.png',
		Fort = 'marker_fort.png',
		GateClosed = 'marker_gate_closed.png',
		RallyPoint = 'marker_rallyPoint.png'
	}

	const MAP_DATA: Record<Territory, MapData> = {
		[Territory.Everfall]: {
			mapImage: 'fort_everfall.png',
			markers: [
				{
					name: Marker.Fort,
					x: 510,
					y: 460
				},
				{
					name: Marker.PointA,
					x: 450,
					y: 260,
					scaleWidth: 40,
					scaleHeight: 40
				},
				{
					name: Marker.PointB,
					x: 630,
					y: 330,
					scaleWidth: 40,
					scaleHeight: 40
				},
				{
					name: Marker.PointC,
					x: 740,
					y: 490,
					scaleWidth: 40,
					scaleHeight: 40
				},
				{
					name: Marker.RallyPoint,
					x: 710,
					y: 210,
					scaleWidth: 50,
					scaleHeight: 50
				}
			]
		}
	};

	function resizeCanvas(canvas) {
		const ratio = canvas.getWidth() / canvas.getHeight();
		const containerWidth = _canvasWrapper.clientWidth;
		const containerHeight = _canvasWrapper.clientHeight;

		const scale = containerWidth / canvas.getWidth();
		const zoom = canvas.getZoom() * scale;

		canvas.setDimensions({ width: containerWidth, height: containerWidth / ratio });
		canvas.setViewportTransform([zoom, 0, 0, zoom, 0, 0]);
	}

	function createImage(imageUrl: string, options: any = {}): Promise<fabric.Image> {
		return new Promise((resolve, reject) => {
			fabric.Image.fromURL(imageUrl, (image: fabric.Image, err: boolean) => {
				if (err) return reject(err);
				image.set(options);
				resolve(image);
			});
		});
	}

	async function createTerritoryMap(territory: Territory) {
		const mapData = MAP_DATA[territory];
		let map = await createImage(mapData.mapImage, { selectable: false });

		let markers: fabric.Image[] = await Promise.all(
			mapData.markers.map(async (markerConfig): Promise<fabric.Image> => {
				let marker = await createImage(markerConfig.name, { selectable: false });
				marker.setPositionByOrigin(new fabric.Point(markerConfig.x, markerConfig.y), 'left', 'top');
				if (markerConfig.scaleWidth) marker.scaleToWidth(markerConfig.scaleWidth);
				if (markerConfig.scaleHeight) marker.scaleToHeight(markerConfig.scaleHeight);
				return marker;
			})
		);

		let group = new fabric.Group([map, ...markers], {});
		group.set({ selectable: false });
		return group;
	}

	async function initCanvas(canvas) {
		resizeCanvas(canvas);

		let mapSize = {};
		let mapGroup = await createTerritoryMap(Territory.Everfall);
		canvas.add(mapGroup);

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

		canvas.on('mouse:down', function (event) {
			const evt = event.e;
			if (evt.altKey === true || event.button === 2) {
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
			fireMiddleClick: true,
			stopContextMenu: true
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
