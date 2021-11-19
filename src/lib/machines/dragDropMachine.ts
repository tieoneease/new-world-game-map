import { createMachine, assign } from 'xstate';

export const key = {};

export const dragDropMachine = createMachine(
	{
		id: 'drag-drop',
		initial: 'idle',
		context: {
			item: {},
			canvas: {}
		},
		on: {
			ASSIGN_CANVAS: {
				actions: 'assignCanvas'
			}
		},
		states: {
			idle: {
				on: {
					DRAG_START: {
						target: 'dragging',
						actions: 'assignItem'
					}
				}
			},
			dragging: {
				exit: 'resetItem',
				on: {
					DROP: {
						target: 'idle'
					}
				}
			}
		}
	},
	{
		actions: {
			assignCanvas: assign({
				canvas: (_, event) => event.canvas
			}),
			assignItem: assign({
				item: (_, event) => event.item
			}),
			resetItem: assign({
				item: () => undefined
			})
		}
	}
);
