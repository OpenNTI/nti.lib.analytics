import EventEmitter from 'events';

import { defineProtected, definePublic, updateValue } from '@nti/lib-commons';
import Logger from '@nti/util-logger';

import {
	isAnalyticsEnabled,
	beginAnalyticsSession,
	endAnalyticsSession,
} from './Api';
import { getEventsForManager, getTypeForEvent } from './events/';
import { Interval, toAnalyticsPath } from './utils';
import Messages from './Messages';

const logger = Logger.get('analytics:Manager');

const HEARTBEAT = 10000;
const SLEEP_TIMEOUT = HEARTBEAT * 2;

const registeredNames = {};

export default class AnalyticsManager extends EventEmitter {
	static getTypeForEvent = getTypeForEvent;

	constructor(name, storage, service, heartbeatDelay = HEARTBEAT) {
		super();

		if (registeredNames[name]) {
			throw new Error('Registering duplicate AnalyticsManager name');
		}

		registeredNames[name] = true;

		Object.defineProperties(this, {
			...defineProtected({
				heartbeat: new Interval(
					() => this.onHeartBeat(),
					heartbeatDelay
				),
				messages: new Messages(name, storage),

				//Events that have started but not finished yet
				//(i.e not been sent or haven't ended)
				activeEvents: [],
				disabled: false,
				suspended: false,
				context: null,
				user: null,
			}),

			...definePublic(getEventsForManager(this)),
		});

		if (service) {
			this.setService(service);
		}
	}

	toAnalyticsPath = toAnalyticsPath;

	setService(service) {
		logger.debug('Applying Service document...');
		if (isAnalyticsEnabled(service)) {
			this.messages.setService(service);

			Object.defineProperties(this, {
				...defineProtected({
					onBeginSession: () => beginAnalyticsSession(service),
					onEndSession: () => endAnalyticsSession(service),
				}),
			});
		} else {
			logger.debug('Analytics are disabled.');
			updateValue(this, 'disabled', true);
		}
	}

	setContext(context) {
		updateValue(this, 'context', context);
	}

	setUser(user) {
		updateValue(this, 'user', user);
	}

	findActiveEvent(predicate) {
		return this.activeEvents.find(predicate) || null;
	}

	pushEvent(event, immediate) {
		//if we are disabled, there's no point in doing anything
		if (this.disabled) {
			return;
		}

		logger.debug('[pushEvent] Event: %o (immediate: %s)', event, immediate);
		if (immediate) {
			logger.debug(
				'[pushEvent] Sending Event: %o (because: immediate: %s)',
				event,
				immediate
			);
			sendEvent(this.messages, event);
		}

		if (!event.isFinished()) {
			logger.debug(
				'[pushEvent] Event is not finished: %o, adding to activeEvents.',
				event
			);
			this.activeEvents.push(event);

			if (!this.suspended) {
				logger.debug(
					'[pushEvent] Event is not suspended, starting heartbeat: %o',
					event
				);
				this.heartbeat.start();
			} else {
				logger.debug('[pushEvent] Event is suspended: %o', event);
			}
		} else {
			logger.debug('[pushEvent] Event is finished: %o', event);
		}
	}

	stopHeartBeat() {
		this.heartbeat.stop();
		this.lastHeartBeat = null;
	}

	onHeartBeat(forceUpdate) {
		const remaining = [];

		if (this.disabled) {
			return;
		}

		const now = new Date();
		const lastHeartBeat = this.lastHeartBeat;

		this.lastHeartBeat = now;

		const diff = lastHeartBeat ? now - lastHeartBeat : 0;
		const wasSleeping = diff > SLEEP_TIMEOUT;

		if (wasSleeping) {
			for (let event of this.activeEvents) {
				sleepEvent(event, lastHeartBeat, now);
			}
		}

		logger.debug('[onHeartBeat] Active Events: %o', this.activeEvents);

		for (let event of this.activeEvents) {
			eventHeartBeat(event);

			if (event.shouldUpdate() || forceUpdate) {
				logger.debug(
					'[onHeartBeat] Sending Event: %o (because: shouldUpdate: %s, force: %s)',
					event,
					event.shouldUpdate(),
					forceUpdate
				);
				sendEvent(this.messages, event, now);
			}

			if (!event.isFinished()) {
				logger.debug('[onHeartBeat] Event is not finished. %o', event);
				remaining.push(event);
			} else {
				logger.debug('[onHeartBeat] Event is finished. %o', event);
			}
		}

		if (wasSleeping) {
			for (let event of remaining) {
				wakeUpEvent(event, now);
			}
		}

		updateValue(this, 'activeEvents', remaining);

		if (!this.activeEvents.length) {
			this.stopHeartBeat();
		}
	}

	suspendEvents() {
		//if we already are suspended, there's nothing to do.
		if (this.suspended || this.disabled) {
			return;
		}

		logger.debug('Suspending Analytics Manager & events...');

		const now = new Date();

		this.onHeartBeat(true);

		updateValue(this, 'suspended', true);
		this.messages.suspend();
		this.stopHeartBeat();

		for (let event of this.activeEvents) {
			suspendEvent(event, now);
		}
	}

	resumeEvents() {
		//if we aren't suspended there's nothing to do.
		if (!this.suspended || this.disabled) {
			return;
		}

		logger.debug('Resuming Analytics Manager & events...');
		updateValue(this, 'suspended', false);

		const now = new Date();

		this.messages.resume();
		this.heartbeat.start();

		for (let event of this.activeEvents) {
			resumeEvent(event, now);
		}

		this.onHeartBeat(true);
	}

	beginSession() {
		if (this.disabled) {
			return;
		}

		if (!this.onBeginSession) {
			throw new Error(
				'Starting a session before the service has been set'
			);
		}

		logger.debug('Beginning Analytics Session...');
		this.onBeginSession();
	}

	endSession() {
		if (this.disabled) {
			return;
		}

		if (!this.onEndSession) {
			throw new Error(
				'Stopping a session before the service has been set'
			);
		}

		logger.debug('Ending Analytics Session...');
		this.onEndSession();
	}
}

function sendEvent(messages, event, now) {
	messages.send(event.getData(now));
	event.onDataSent();
}

function eventHeartBeat(event) {
	if (event.onHeartBeat) {
		event.onHeartBeat();
	}
}

function suspendEvent(event, now) {
	if (event.suspend) {
		event.suspend(now);
	}
}

function resumeEvent(event, now) {
	/* istanbul ignore else */
	if (event.resume) {
		event.resume(now);
	}
}

function sleepEvent(event, sleepTime) {
	if (event.sleep) {
		event.sleep(sleepTime);
	}
}

function wakeUpEvent(event, now) {
	if (event.wakeUp) {
		event.wakeUp(now);
	}
}
