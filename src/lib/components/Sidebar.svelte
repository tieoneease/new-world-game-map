<script lang="ts">
	export let state;
	export let send;

	let group;
	function dragStart(e) {
		if ($state.value === 'idle') {
			send({ type: 'DRAG_START', item: e.target })
		}
	}
</script>

<div id="sidebar">
	<div bind:this={group} class="group" draggable="true" on:dragstart={dragStart}>
		<img alt="healer" class="ui avatar image" src="marker_healer.png" />
		<span>Healer</span>
	</div>
</div>

<style>
	#sidebar {
		min-width: 500px;
		background-color: lightpink;
	}
</style>
