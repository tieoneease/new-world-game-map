<script lang="ts">
	export let config: DraggableConfig;
	import { createEventDispatcher } from 'svelte';

	interface DraggableConfig {
		imageUrl: string;
		label: string;
	}

	let dragImage: HTMLImageElement;
	const dispatch = createEventDispatcher();
	function dragStart(event) {
		event.dataTransfer.setDragImage(dragImage, dragImage.clientWidth, dragImage.clientHeight);
		dispatch('dragged', config);
	}
</script>

<div class="item" draggable="true" on:dragstart={dragStart} on:dragged>
	<img bind:this={dragImage} alt="healer" class="ui avatar image" src={config.imageUrl} />
	<span>{config.label}</span>
</div>

<style>
	.item:hover * {
		color: black;
	}

	.item:hover > img {
		filter: brightness(10%);
	}

	img {
		filter: brightness(70%);
	}
</style>
