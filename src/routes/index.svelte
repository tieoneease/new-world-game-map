<script lang="ts">
	import { Sidebar, Canvas } from '$lib/components';
	import { useMachine } from '@xstate/svelte';
</script>

<div class="container">
	<Sidebar />
	<Canvas />
</div>

<style>
	.container {
		height: 100vh;
		background-color: blue;
		display: flex;
	}
</style>
