<script lang="ts">
	import { Sidebar, Canvas } from '$lib/components';
	import { createMachine } from 'xstate';
	import { useMachine } from '@xstate/svelte';
	import { onMount, setContext } from 'svelte';

	import { dragDropMachine, key as dragDropKey } from '$lib/machines/dragDropMachine';

	const { state, send } = useMachine(dragDropMachine);
</script>

<div>
	<Sidebar {state} {send} />
	<Canvas {state} {send} />
</div>

<style>
	div {
		height: 100vh;
		display: flex;
	}
</style>
