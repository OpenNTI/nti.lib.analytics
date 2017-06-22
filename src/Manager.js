/*global localStorage*/
import EventEmitter from 'events';

import {Tasks} from 'nti-commons';
import Logger from 'nti-util-logger';

import {postAnalytics, endAnalyticsSession} from './Api';
import {isKnown, WATCH_VIDEO} from './MimeTypes';
import {getModel} from './models';

const SUSPENSION_EVENT_TYPES = [WATCH_VIDEO];

const SECOND = 1000; //in ms
const MINUTE = 60 * SECOND; // in ms
const THIRTY_MINUTES = 30 * MINUTE;// in ms

export const LOCAL_STORAGE_KEY = 'analytics_queue';
const logger = Logger.get('analytics:Manager');


export default class Manager extends EventEmitter {
	postFrequency = 10000
	queue = []

	/**
	 * @private
	 * @param  {Object} event - and event
	 * @return {boolean} - true if the event should toggle the idle monitor state.
	 */
	shouldEventAlterIdleMonitor = event => this.idleMonitor && event && SUSPENSION_EVENT_TYPES.includes(event.MimeType)


	init (idleTimeout = THIRTY_MINUTES) {
		this.startTimer();

		const idle = this.idleMonitor = new Tasks.Idle({ timeout: idleTimeout });
		idle.on('idle', () => this.endSession('idle monitor'));
		idle.on('active', () => this.resumeSession('no longer idle'));

		this.processSerialized();
	}


	start (event) {
		logger.debug('Analytics Store received event: %s, %o', event.MimeType, event);
		const {MimeType} = (event || {});
		if (!isKnown(MimeType)) {
			throw new Error('emitEvent action called with unrecognized MimeType. Stop it.'.concat(MimeType));
		}

		this.enqueueEvents(event);

		if (this.shouldEventAlterIdleMonitor(event)) {
			this.idleMonitor.stop();
		}
	}


	end (event) {
		event.finish();//should we look for the event in the queue??

		if (this.shouldEventAlterIdleMonitor(event)) {
			this.idleMonitor.start();
		}
	}


	/**
	 * Appends events to the internal queue and serializes them to localStorage.
	 *
	 * @private
	 * @param {...Object} events - the events to enqueue.
	 * @returns {void}
	 */
	enqueueEvents (...events) {
		const newEvents = events.filter(x => !this.queue.includes(x));
		this.queue = [...this.queue, ...newEvents];
		this.serialize();
	}


	/**
	 * Marks events as halted. Returns a promise to fulfill with an array of halted events.
	 *
	 * @private
	 * @param {Object[]} [events] events - to halt, defaults to the internal queue.
	 * @returns {Promise} resolves with array of newly halted events. Events that were already finished are omitted.
	 */
	haltActiveEvents (events = this.queue) {
		const openValidEvent = event => event && isKnown(event.MimeType) && !event.finished;

		function maybeHaltEvent (event) {
			try {
				getModel(event.MimeType).halt(event);
			} catch(e) {
				logger.warn('Unknown analytics event? %o', event);
			}

			return event;
		}

		return Promise.resolve(
			Array.isArray(events)
				? events.filter(openValidEvent).map(maybeHaltEvent)
				: []
		);
	}


	/**
	 * Ends the current analytics session.
	 *
	 * @public
	 * @param {string} reason - the reason for ending the session.
	 * @returns {Promise} - resolves on completion
	 */
	endSession (reason = 'no reason specified') {
		logger.debug('Ending analytics session. (%s)', reason);
		clearTimeout(this.timeoutId);
		return this.haltActiveEvents()
			.then(()=> this.processQueue())
			.then(() => endAnalyticsSession());
	}


	/**
	 * Fires a resume event, and restarts the timer.
	 *
	 * @private
	 * @param {string} [reason] - why the session was resumed.
	 * @returns {void}
	 */
	resumeSession (reason = 'no reason specified') {
		logger.debug('Resume analytics session. (%s)', reason);
		this.emit('resume');
		this.startTimer();
	}


	/**
	 * Serialize the internal queue to local storage.
	 *
	 * @private
	 * @returns {void}
	 */
	serialize () {
		try {
			localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this.queue));
		}
		catch (e) {
			// no local storage? that's fine.
		}
	}


	/**
	 * @private
	 * @returns {Object[]} An array of simple JSO versions of event models stored in local storage.
	 */
	deserialize () {
		try {
			let q = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
			if (Array.isArray(q)) {
				return q;
			}
			// logger.debug('localStorage events: %o', q);
		} catch (e) {
			//no local storage
		}

		return [];
	}


	/**
	 * Clears the values stored in local storage for our scope.
	 *
	 * @private
	 * @returns {void}
	 */
	clearSerialized () {
		try {
			localStorage.removeItem(LOCAL_STORAGE_KEY);
		} catch (e) {
			//
		}
	}


	/**
	 * Read events from storage and attempt to process them.
	 * Called during init to process events that we failed to
	 * send before the last page load.
	 *
	 * @private
	 * @returns {Promise} - resolves when completes.
	 */
	processSerialized () {
		return this.haltActiveEvents(this.deserialize())
			.then(events => (
				this.enqueueEvents(...events),
				this.processQueue()
			)
			);
	}

	/**
	 * @private
	 * @returns {Promise} - resolves on completion.
	 */
	processQueue () {
		if (this.queue.length === 0) {
			return Promise.resolve('No events in the queue.');
		}

		const bins = {finished: [], unfinished: []};
		const intoBins = (acc, item) => ((item.finished ? acc.finished : acc.unfinished).push(item), acc);

		const {unfinished, finished: items} = this.queue.reduce(intoBins, bins);


		const data = items.map(item => item.getData ? item.getData() : item);

		if (items.length === 0) {
			return Promise.resolve('No finished events in the queue');
		}



		//We're going to post, clear the queue
		this.clearSerialized();
		// return unfinished events to the queue
		this.queue = [...unfinished];
		this.serialize();

		return postAnalytics(data)

			.then(response => (
				logger.debug('%i of %i analytics events accepted.', response.EventCount, items.length),
				response))

			.catch(r => {
				if (r.statusCode === 501) {
					logger.warn('Dropping analytics: ', r.message);
					return;
				}

				logger.warn('Trouble sending analytics data: %o', r);
				// put items back in the queue
				this.queue.push(...items);
				this.serialize();

				//continue the rejection in the promise chain
				return Promise.reject(r);
			});
	}


	/**
	 * for submitting analytics events/flushing the queue.
	 * @private
	 * @returns {void}
	 */
	startTimer = () => {
		clearTimeout(this.timeoutId);
		this.timeoutId = setTimeout(() =>
			// process the queue and start the timer again.
			this.processQueue()
				.catch((er)=> {
					logger.warn('Analytics Error: %o', er);
					//prevent errors from stopping the loop
					//by not returning a rejected promise.
				})
				.then(this.startTimer),
		this.postFrequency);
	}


	/**
	 * Utility method to register a callback for the 'resume' event.
	 *
	 * @public
	 * @param {ResumeEventHandler} fn - A handler for the resume event.
	 * @returns {void}
	 */
	addResumeListener (fn) {
		this.addListener('resume', fn);
	}


	/**
	 * Utility method to unregister a callback for the 'resume' event.
	 *
	 * @public
	 * @param {ResumeEventHandler} fn - A handler for the resume event.
	 * @returns {void}
	 */
	removeResumeListener (fn) {
		this.removeListener('resume', fn);
	}
}


/**
 * A handler for the Resume Event for Analytic Sessions.
 *
 * @callback Manager~ResumeEventHandler
 */
