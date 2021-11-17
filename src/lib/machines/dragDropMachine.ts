import { createMachine } from 'xstate';

export enum DragDropEvents {
	DRAG_START
}

export default createMachine({
	id: 'drag-drop',
	initial: 'idle',
	states: {
		idle: {},
		dragging: {},
		dropped: {}
	}
});
