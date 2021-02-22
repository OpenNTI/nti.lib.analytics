import EventEmitter from 'events';

const AFTER_BATCH_EVENTS = 'after-events-sent';

const BUS = new EventEmitter();
BUS.setMaxListeners(0); //don't test for memory leaks.

export default class Hooks {
	static triggerAfterBatchEvents(...args) {
		BUS.emit(AFTER_BATCH_EVENTS, ...args);
	}

	static addAfterBatchEventsListener(fn) {
		BUS.addListener(AFTER_BATCH_EVENTS, fn);
	}

	static removeAfterBatchEventsListener(fn) {
		BUS.removeListener(AFTER_BATCH_EVENTS, fn);
	}
}
