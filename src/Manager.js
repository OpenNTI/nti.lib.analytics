import EventEmitter from 'events';

import {defineProtected, definePublic, updateValue} from 'nti-commons';
import Logger from 'nti-util-logger';


import {
	isAnalyticsEnabled,
	beginAnalyticsSession,
	endAnalyticsSession
} from './Api';
import {getEventsForManager} from './events/';
import {Interval} from './utils';
import Messages from './Messages';


const logger = Logger.get('analytics:Manager');

const HEARTBEAT = 10000;

const registeredNames = {};

export default class AnalyticsManager extends EventEmitter {
	constructor (name, storage, service, heartbeatDelay = HEARTBEAT) {
		super();

		if (registeredNames[name]) { throw new Error('Registering duplicate AnalyticsManager name'); }

		registeredNames[name] = true;

		Object.defineProperties(this, {
			...defineProtected({
				heartbeat: new Interval(() => this.onHeartBeat(), heartbeatDelay),
				messages: new Messages(name, storage),

				//Events that have started but not finished yet
				//(i.e not been sent or haven't ended)
				activeEvents: [],
				disabled: false,
				suspended: false,
				context: null,
				user: null
			}),

			...definePublic(
				getEventsForManager(this)
			)
		});

		if (service) {
			this.setService(service);
		}
	}


	setService (service) {
		if (isAnalyticsEnabled(service)) {
			this.messages.setService(service);

			Object.defineProperties(this, {
				...defineProtected({
					onBeginSession: () => beginAnalyticsSession(service),
					onEndSession: () => endAnalyticsSession(service)
				})
			});

		} else {
			updateValue(this, 'disabled', true);
		}
	}


	setContext (context) {
		updateValue(this, 'context', context);
	}


	setUser (user) {
		updateValue(this, 'user', user);
	}


	findActiveEvent (predicate) {
		for (let event of this.activeEvents) {
			if (predicate(event)) {
				return event;
			}
		}

		return null;
	}


	pushEvent (event, immediate) {
		//if we are disabled, there's no point in doing anything
		if (this.disabled) { return; }

		logger.debug('[pushEvent] Event: %o (immediate: %s)', event, immediate);
		if (immediate) {
			logger.debug('[pushEvent] Sending Event: %o (because: immediate: %s)', event, immediate);
			sendEvent(this.messages, event);
		}

		if (!event.isFinished()) {
			logger.debug('[pushEvent] Event is not finished: %o, adding to activeEvents.', event);
			this.activeEvents.push(event);

			if (!this.suspended) {
				logger.debug('[pushEvent] Event is not suspended, starting heartbeat: %o', event);
				this.heartbeat.start();
			} else {
				logger.debug('[pushEvent] Event is suspended: %o', event);
			}
		} else {
			logger.debug('[pushEvent] Event is finished: %o', event);
		}
	}


	onHeartBeat (forceUpdate) {
		const remaining = [];

		logger.debug('[onHeartBeat] Active Events: %o', this.activeEvents);

		for (let event of this.activeEvents) {
			eventHeartBeat(event);

			if (event.shouldUpdate() || forceUpdate) {
				logger.debug('[onHeartBeat] Sending Event: %o (because: shouldUpdate: %s, force: %s)', event, event.shouldUpdate(), forceUpdate);
				sendEvent(this.messages, event);
			}

			if (!event.isFinished()) {
				logger.debug('[onHeartBeat] Event is not finished. %o', event);
				remaining.push(event);
			} else {
				logger.debug('[onHeartBeat] Event is finished. %o', event);
			}
		}

		updateValue(this, 'activeEvents', remaining);

		if (!this.activeEvents.length) {
			this.heartbeat.stop();
		}
	}


	suspendEvents () {
		//if we already are suspended, there's nothing to do.
		if (this.suspended) { return; }

		this.onHeartBeat(true);

		updateValue(this, 'suspended', true);
		this.messages.suspend();
		this.heartbeat.stop();

		for (let event of this.activeEvents) {
			suspendEvent(event);
		}
	}


	resumeEvents () {
		//if we aren't suspended there's nothing to do.
		if (!this.suspended) { throw new Error('Calling resume on analytics that are not suspended. Likely a developer error.'); }

		updateValue(this, 'suspended', false);

		this.messages.resume();
		this.heartbeat.start();

		for (let event of this.activeEvents) {
			resumeEvent(event);
		}

		this.onHeartBeat(true);
	}


	beginSession () {
		if (this.disabled) { return; }

		if (!this.onBeginSession) { throw new Error('Starting a session before the service has been set'); }

		this.onBeginSession();
	}


	endSession () {
		if (this.disabled) { return; }

		if (!this.onEndSession) { throw new Error('Stopping a session before the service has been set'); }

		this.onEndSession();
	}


}

function sendEvent (messages, event) {
	messages.send(event.getData());
	event.onDataSent();
}

function eventHeartBeat (event) {
	if (event.onheartBeat) { event.onHeartBeat(); }
}

function suspendEvent (event) {
	if (event.suspend) { event.suspend(); }
}

function resumeEvent (event) {
	if (event.resume) { event.resume(); }
}
