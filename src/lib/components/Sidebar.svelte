<script lang="ts">
	export let send;
	export let context;

	let group;

	function dragStart(e) {
		console.log('dragging...')
		e.dataTransfer.setData('text/plain', 'butt');
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
