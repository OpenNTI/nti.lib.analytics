import Logger from 'nti-util-logger';
import {defineProtected} from 'nti-commons';

import {isFunction} from './index';

const logger = Logger.get('analytics:Heartbeat');

/*
 * Default interval if none is specified when instantiating a Heartbeat.
 */
const defaultInterval = 1000;

/**
 * Pacemakers indexed by their timing/interval, e.g. {2000: pacemaker_instance, 5000: pacemaker_instance}
 */
export const PacemakersByInterval = {};

/**
 * Keeps track of added Heartbeat instances and calls their onPulse method
 * at the specified interval. This allows us to handle multiple heartbeats
 * with a single setInterval call.
 */
export class Pacemaker {

	/**
	 * Construct a new instance to invoke Heartbeat callbacks at the given interval.
	 * @param {number} pulseInterval The interval, in milliseconds, at which to pulse. :/
	 * @returns {void}
	 */
	constructor (pulseInterval) {
		if (typeof pulseInterval !== 'number') {
			throw new Error('pulseInterval argument must be a number.');
		}
		if (pulseInterval < defaultInterval) {
			logger.warn('Creating a Pacemaker with a fast interval (%d).', pulseInterval);
		}
		this.interval = pulseInterval;
		this.beats = new Set();
	}

	/**
	 * Start sending periodic pulses to our Heartbeats.
	 * @returns {void}
	 */
	start () {
		if (!this.intervalId) {
			this.intervalId = setInterval(() => this.pulse(), this.interval);
		}
	}

	/**
	 * Stop sending pulses to our Heartbeats.
	 * @returns {void}
	 */
	stop () {
		clearInterval(this.intervalId);
		delete this.intervalId;
	}

	/**
	 * Currently running/sending periodic pulses?
	 * @returns {boolean} ture, if running. False otherwise.
	 */
	get running () {
		return !!this.intervalId;
	}

	/**
	 * Register a Heartbeat to receive periodic pulses.
	 * @param {Heartbeat} heartbeat An instance of Heartbeat.
	 * @returns {void}
	 */
	add (heartbeat) {
		this.beats.add(heartbeat);
		if (!this.running) {
			this.start();
		}
	}

	/**
	 * Un-register the given heartbeat. Stops the Pacemaker if none remain.
	 * @param {Heartbeat} heartbeat An instance of Heartbeat.
	 * @returns {void}
	 */
	remove (heartbeat) {
		this.beats.delete(heartbeat);
		if (this.beats.size === 0) {
			this.stop();
		}
	}

	/**
	 * Send a pulse to each registered Heartbeat.
	 * @returns {void}
	 */
	pulse () {
		this.beats.forEach(beat => beat.onPulse());
	}

	/**
	 * @returns {number} the number of currently registered Heartbeats.
	 */
	get size () {
		return this.beats.size;
	}

}



/**
 * The key for looking up a pacemaker in PacemakersByInterval
 *
 * @param {number} interval an interval
 * @returns {number} key
 */
function keyForPacemaker (interval) {
	return interval;
}


/**
 * A Pacemaker instance for the given interval, instantiating one if necessary.
 * @param {number} interval the interval
 * @returns {Pacemaker} Pacemaker for the interval.
 */
export function pacemakerForInterval (interval) {
	let key = keyForPacemaker(interval);
	if (!PacemakersByInterval[key]) {
		logger.debug('new Pacemaker: interval: %d', interval);
		PacemakersByInterval[key] = new Pacemaker(interval);
	}
	return PacemakersByInterval[key];
}

/**
 * Registers a heartbeat to receive callbacks at its interval.
 * @param {Heartbeat} heartbeat the Heartbeat
 * @returns {void}
 */
function add (heartbeat) {
	pacemakerForInterval(heartbeat.interval).add(heartbeat);
}

/**
 * Un-register the given heartbeat; Stop receiving callbacks.
 * @param {Heartbeat} heartbeat the Heartbeat
 * @returns {void}
 */
function remove (heartbeat) {
	pacemakerForInterval(heartbeat.interval).remove(heartbeat);
}



/*
 * Encapsulates a callback function and an interval, to be registered with a Pacemaker instance
 * who will invoke onPulse at the given interval.
 */
export default class Heartbeat {

	constructor (callback, interval = defaultInterval) {
		if (!isFunction(callback)) {
			throw new TypeError('Callback must be a function.');
		}

		if (isNaN(interval) || interval < 1) {
			throw new TypeError('Interval must be a number greater than 0!');
		}

		Object.defineProperties(this, {
			...defineProtected({
				callback,
				interval
			})
		});
		add(this);
	}

	onPulse () {
		try {
			if (this.callback() === false) {
				this.die();
			}
		} catch (e) {
			this.die();
		}
	}

	die = () => {
		remove(this);
	}

}
