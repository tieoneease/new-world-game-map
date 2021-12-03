<script lang="ts">
	export let state;
	export let send;

	import { fabric } from 'fabric';
	import { onMount, getContext } from 'svelte';
	import { key as dbKey } from '$lib/db/gun';
	import uuid from 'uuid/v4';

	const { getDb } = getContext(dbKey);
	const db = getDb();

	const markersDb = db.get('dummymap0').get('markers');

	let _canvasWrapper: HTMLDivElement;
	let _canvasElement: HTMLCanvasElement;
	let _canvas: fabric.Canvas;

	function retrieveMarkerById(id) {
		let object = undefined;
		_canvas.getObjects().forEach((obj) => {
			if (obj.id === id) object = obj;
		});
		return object;
	}

	function canvasToAbsolute(canvas, x, y) {
		const point = new fabric.Point(x, y);
		const invTrans = fabric.util.invertTransform(canvas.viewportTransform);
		const newPoint = fabric.util.transformPoint(point, invTrans);
		return { x: newPoint.x, y: newPoint.y };
	}

	function moveImage(marker: fabric.Object, config) {
		const point = new fabric.Point(config.x, config.y);
		marker.setPositionByOrigin(point, 'center', 'center');
		marker.setCoords();
		_canvas.renderAll();
	}

	function drawImageToMap({ id, x, y, imageUrl }) {
		fabric.Image.fromURL(imageUrl, (image: fabric.Image, err: boolean) => {
			if (err) console.error(err);

			image.set({
				centeredScaling: true,
				hasControls: false,
				hasBorders: false
			});
			image.id = id;
			image.setPositionByOrigin(new fabric.Point(x, y), 'center', 'center');
			_canvas.add(image);
		});
	}

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

	function resizeCanvas(canvas, container) {
		const containerWidth = window.innerWidth;
		const containerHeight = window.innerHeight;

		const boundingLength = Math.min(containerWidth, containerHeight);

		const scale = containerWidth / canvas.getWidth();
		const zoom = canvas.getZoom() * scale;
		canvas.setHeight(boundingLength);
		canvas.setWidth(boundingLength);
		canvas.renderAll();
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

		return new fabric.Group([map, ...markers], {
			selectable: false
		});
	}

	function setupCanvasEventHandlers(canvas: fabric.Canvas) {
		canvas.on('mouse:wheel', function (opt) {
			const delta = opt.e.deltaY;
			let zoom = canvas.getZoom();
			zoom *= 0.999 ** delta;
			if (zoom > 20) zoom = 20;
			if (zoom < 0.5) zoom = 0.5;
			canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
			opt.e.preventDefault();
			opt.e.stopPropagation();
		});

		canvas.on('mouse:down', function (event) {
			const evt = event.e;
			if (evt.altKey || event.button === 2 || evt.metaKey) {
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

		canvas.on('dragenter', function (event) {
			if ($state.value === 'dragging') {
			}
		});

		canvas.on('object:moving', (event) => {
			console.log(event.target.id);
			const x = event.e.offsetX;
			const y = event.e.offsetY;

			const absolutePoint = canvasToAbsolute(canvas, x, y);
			markersDb.get(event.target.id).put(absolutePoint);
		});

		canvas.on('drop', function (event) {
			const x = event.e.offsetX;
			const y = event.e.offsetY;

			const absolutePoint = canvasToAbsolute(canvas, x, y);
			const imageUrl = $state.context.item.imageUrl;
			send({ type: 'DROP', e: event });
			// send x, y, image url to db
			const id = uuid();
			markersDb.get(id).put({
				id,
				x: absolutePoint.x,
				y: absolutePoint.y,
				imageUrl
			});
		});
	}

	async function initCanvas(canvas: fabric.Canvas, canvasWrapper: HTMLDivElement) {
		send({ type: 'ASSIGN_CANVAS', canvas });
		canvas.hoverCursor = 'default';
		resizeCanvas(canvas, canvasWrapper);

		let mapGroup = await createTerritoryMap(Territory.Everfall);
		canvas.setBackgroundImage(mapGroup);
		canvas.viewportCenterObject(mapGroup);
		setupCanvasEventHandlers(canvas);
		canvas.zoomToPoint(
			new fabric.Point(canvas.width / 2, canvas.height / 2),
			canvas.height / mapGroup.height
		);
		canvas.renderAll();
	}

	onMount(() => {
		_canvas = new fabric.Canvas(_canvasElement, {
			fireRightClick: true,
			fireMiddleClick: true,
			stopContextMenu: true,
			backgroundColor: '#F3F3F3'
		});
		initCanvas(_canvas, _canvasWrapper);

		markersDb.map().on((markerConfig, key) => {
			console.log(markerConfig.id)
			// upon receive, do transform, place on canvas
			if (!_canvas) return;
			const marker = retrieveMarkerById(markerConfig.id);
			if (marker) moveImage(marker, markerConfig);
			else drawImageToMap(markerConfig);
		});
	});
</script>

<svelte:window on:resize={() => resizeCanvas(_canvas, _canvasWrapper)} />

<div>
	<canvas id="canvas" bind:this={_canvasElement} />
</div>

<style>
</style>
