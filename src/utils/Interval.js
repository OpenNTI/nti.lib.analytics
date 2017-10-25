export default class Interval {
	constructor (callback, interval) {
		if (!callback) { throw new Error('Cannot create interval without callback'); }
		if (!interval) { throw new Error('Cannot create interval without time'); }

		this.callback = callback;
		this.interval = interval;
	}


	onInterval () {
		if (!this.running) { return; }

		this.callback();

		this.timeout = setTimeout(() => {
			this.onInterval();
		}, this.interval);
	}


	start () {
		if (this.running) { return; }

		this.running = true;

		this.timeout = setTimeout(() => {
			this.onInterval();
		}, this.interval);
	}


	stop () {
		if (!this.running) { return; }

		this.running = false;
		clearTimeout(this.timeout);
	}
}
