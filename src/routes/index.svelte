<script>
	import { fabric } from 'fabric';
	import { onMount } from 'svelte';

	let canvas;

	onMount(() => {
		let canv = new fabric.Canvas(canvas);

		const rect = new fabric.Rect({
			left: 10,
			top: 10,
			width: 20,
			height: 15,
			fill: 'blue'
		});

		const circle = new fabric.Circle({
			radius: 20,
			fill: 'blue',
			left: 100,
			top: 100
		});

		canv.add(circle);

		canv.add(rect);
	});
</script>

<canvas bind:this={canvas} width="500" height="300" />
