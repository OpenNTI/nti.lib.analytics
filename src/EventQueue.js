import EventEmitter from 'events';

const IMMEDIATE_TIMEOUT = 300;
const TIMEOUT = 10000;


export default class EventQueue extends EventEmitter {
	queue = []

	enqueue (event, immediate) {
		queue.push(event);

		if (immediate) {
			this.flush();
		} else {

		}
	}
}
