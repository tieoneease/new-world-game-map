import { createMachine, assign } from 'xstate';

export const dragDropMachine = createMachine({
	id: 'drag-drop',
	initial: 'idle',
	context: {
		item: {}
	},
	states: {
		idle: {
			on: {
				DRAG_START: {
					target: 'dragging',
					actions: assign({
						item: (_, event) => event.item
					})
				}
			}
		},
		dragging: {
			on: {
				DROP: {
					target: 'idle',
					actions: assign({
						item: () => undefined
					})
				}
			}
		}
	}
});
