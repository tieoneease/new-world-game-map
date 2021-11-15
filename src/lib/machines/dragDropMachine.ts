import { createMachine } from 'xstate';

export default createMachine({
	id: 'drag-drop',
	initial: 'idle',
	states: {
		idle: {},
		dragging: {}
	}
});
