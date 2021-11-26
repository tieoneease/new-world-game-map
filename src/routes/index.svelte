<script lang="ts">
	import { gun, key as gunKey } from '$lib/db/gun';
	import { Sidebar, Canvas } from '$lib/components';
	import { useMachine } from '@xstate/svelte';
	import { onMount, setContext } from 'svelte';

	import { dragDropMachine, key as dragDropKey } from '$lib/machines/dragDropMachine';

	const { state, send } = useMachine(dragDropMachine);

	setContext(gunKey, {
		getDb: () => gun
	});
</script>

<div class="html">
	<Sidebar {state} {send} />
	<Canvas {state} {send} />
</div>

<style>
	div {
		height: 100vh;
		display: flex;
		justify-content: center;
	}
</style>
