<script lang="ts">
	import { Canvas } from '$lib/components';
</script>

<div class="container">
	<div id="sidebar" />
	<Canvas />
</div>

<style>
	.container {
		height: 100vh;
		background-color: blue;
		display: flex;
	}

	#sidebar {
		min-width: 300px;
		background-color: lightpink;
	}
</style>
