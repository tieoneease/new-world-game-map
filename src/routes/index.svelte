<script lang="ts">
	import { Sidebar, Canvas } from '$lib/components';
	import { createMachine } from 'xstate';
	import { useMachine } from '@xstate/svelte';

	import { dragDropMachine } from '$lib/machines/dragDropMachine';

	const { state, send } = useMachine(dragDropMachine);

	import GUN from 'gun';
</script>

<div class="container">
	<Sidebar {state} {send} />
	<Canvas {state} {send} />
</div>

<style>
	.container {
		height: 100vh;
		background-color: blue;
		display: flex;
	}
</style>
