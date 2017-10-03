import uuid from 'uuid';
import {definePublic, defineProtected, updateValue} from 'nti-commons';

import {UNKNOWN_TYPE, isKnown} from '../../MimeTypes';
import HeartbeatManager from '../../utils/Heartbeat';
import {isFunction} from '../../utils';

const seconds = (startTime = Date.now(), endTime = Date.now()) => Math.round((endTime - startTime) / 1000);

export default class Base {

	static halt (event) {
		updateValue(event, 'halted', true);
		this.finish(event);
	}


	static finish (event, endTime = Date.now()) {
		this.freeHeartbeat(event);
		if (event.finished) {
			console.warn('finish invoked on an already-finished analytics event. %o', event); //eslint-disable-line no-console
		}

		const useEndTime = event.lastBeat == null
						|| HeartbeatManager.interval == null
						// If more than heartbeatInterval has passed between lastBeat and endTime, use lastBeat.
						// This provides a fairly accurate end time for cases where the browser/app was closed
						// and this event is being finished after the fact. (from localStorage).
						|| ((endTime - (HeartbeatManager.interval || 0)) < event.lastBeat);
		const end = useEndTime ? endTime : event.lastBeat;

		// updateValue() creates non-enumerable keys if they don't exist... if the event is a deserialized
		// JSO instead of an instance of an event model, then these properties may not previously exist.
		if (Object.getPrototypeOf(event) === Object.prototype) {
			Object.assign(event, {
				'time_length': null,
				'timestamp': null,
				'finished': true,
			});
		}

		updateValue(event, 'time_length', seconds(event.startTime, end));
		updateValue(event, 'timestamp', end / 1000); // the server is expecting seconds

		updateValue(event, 'finished', true);
	}


	static freeHeartbeat (event) {
		if (event.heartbeat) {//eslint-disable-line
			event.heartbeat.die();
			delete event.heartbeat;
		}
	}


	constructor (mimeType, RootContextID, startTime) {

		if (!mimeType || !isKnown(mimeType)) {
			console.warn('Unrecognized MimeType for analytics event: ' + mimeType); //eslint-disable-line no-console
		}

		Object.defineProperties(this, {

			...defineProtected({
				id: uuid(),

				// updates an internal timestamp to provide an approximate end time for cases where
				// an instance didn't finish normally (as when retrieved from localStorage after the
				// app window was closed and re-opened later.
				heartbeat: new HeartbeatManager(this.onPulse),
				lastBeat: Date.now(),

				finished: false,
				halted: false,
			}),

			...definePublic({
				startTime: startTime || Date.now(),
				MimeType: mimeType || UNKNOWN_TYPE,
				RootContextID,
				timestamp: null,
				'time_length': null,
				'context_path': null
			})
		});

		if (!this.RootContextID) {
			throw new Error('RootContextID is required!');
		}
	}


	onPulse = () => {
		if (this.finished) {
			Base.freeHeartbeat(this);
			return false;
		}
		updateValue(this, 'lastBeat', Date.now());
	}


	halt = () => Base.halt(this)


	finish (endTime = Date.now()) { Base.finish(this, endTime); }


	setContextPath = (path) => updateValue(this, 'context_path', path)


	getDuration = () => this.finished ? this.time_length : seconds(this.startTime)


	toJSON = () => this.getData()


	getData () {
		const output = {};
		const has = x => x != null && (!x.toJSON || x.toJSON() != null);

		for (let [key, value] of Object.entries(this)) {

			if (has(value) && !isFunction(value)) {

				if (value && isFunction(value.getData)) {
					value = value.getData();
				}

				output[key] = value;
			}
		}

		return output;
	}
}
