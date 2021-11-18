<script lang="ts">
	export let config: DraggableConfig;

	interface DraggableConfig {
		imageUrl: string;
		label: string;
	}
</script>

<div draggable="true" on:dragstart>
	<img alt="healer" class="ui avatar image" src={config.imageUrl} />
	<span>{config.label}</span>
</div>
