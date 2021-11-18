<script lang="ts">
	export let state;
	export let send;

	import { DraggableGroup } from '$lib/components';

	const dragImageMap = new Map<string, HTMLImageElement>();

	function dragged(e) {
		if ($state.value === 'idle') {
			send({ type: 'DRAG_START', item: e.detail });
		}
	}

	const groups = [
		{ imageUrl: 'marker_group1.png', label: 'Group 1' },
		{ imageUrl: 'marker_group2.png', label: 'Group 2' },
		{ imageUrl: 'marker_group3.png', label: 'Group 3' },
		{ imageUrl: 'marker_group4.png', label: 'Group 4' }
	];

	const units = [
		{ imageUrl: 'marker_healer.png', label: 'Healer' },
		{ imageUrl: 'marker_hammer.png', label: 'Hammer' }
	];
</script>

<div id="sidebar" class="ui left fixed vertical menu">
	<div class="item">
		<div class="header">Groups</div>
		<div class="menu">
			{#each groups as config}
				<DraggableGroup on:dragged={dragged} {config} />
			{/each}
		</div>
	</div>

	<div class="item">
		<div class="header">Units</div>
		<div class="menu">
			{#each units as config}
				<DraggableGroup on:dragged={dragged} {config} />
			{/each}
		</div>
	</div>
</div>

<style>
	#sidebar {
		min-width: 300px;
	}
</style>
