import { defineProtected, updateValue } from '@nti/lib-commons';
import Logger from '@nti/util-logger';

import { getError } from '../../utils';

import Base from './Base';

const logger = Logger.get('analytics:event');

export default class TimedAnalyticEvent extends Base {
	static makeFactory(manager) {
		const Type = this;
		const { EventType, Immediate } = this;

		if (!manager) {
			throw new TypeError('Invalid argument for manager.');
		}

		return {
			start: (resourceId, data) => {
				try {
					if (manager.disabled) {
						return;
					}

					if (this.findActiveEvent(manager, resourceId)) {
						throw new Error(
							`Cannot start a new event for ${resourceId} while an existing event is still active.`
						);
					}

					const event = new Type(
						EventType,
						resourceId,
						data,
						manager
					);

					manager.pushEvent(event, Immediate);
				} catch (e) {
					logger.error(
						'Could not start event for %s, because: %s',
						resourceId,
						getError(e)
					);
				}
			},

			stop: (resourceId, data) => {
				try {
					if (manager.disabled) {
						return;
					}

					const event = this.findActiveEvent(manager, resourceId);

					if (!event) {
						throw new Error(
							"Cannot stop an event that hasn't been started."
						);
					}

					event.stop(data);
				} catch (e) {
					logger.error(
						'Could not stop event for %s, because: %s',
						resourceId,
						getError(e)
					);
				}
			},

			update: (resourceId, data) => {
				try {
					if (manager.disabled) {
						return;
					}

					const event = this.findActiveEvent(manager, resourceId);

					if (!event) {
						throw new Error(
							"Cannot update an event that hasn't been started."
						);
					}

					event.updateData(data);
				} catch (e) {
					logger.error(
						'Could not update event for %s, because: %s',
						resourceId,
						getError(e)
					);
				}
			},
		};
	}

	constructor(type, resourceId, data, manager) {
		super(type, resourceId, data, manager);

		Object.defineProperties(this, {
			...defineProtected({
				heartBeatCount: 0,
				updatedCount: 0,
				endTime: null,
				suspended: false,
			}),
		});
	}

	getData(now) {
		const data = super.getData();
		const { startTime } = this;
		const endTime = this.sleepTime || this.endTime || now || new Date();

		return {
			...data,
			Duration: (endTime - startTime) / 1000,
		};
	}

	onDataSent() {
		updateValue(this, 'updatedCount', Math.min(this.updatedCount + 1, 6));
		updateValue(this, 'heartBeatCount', 0);
	}

	isFinished() {
		return !!this.endTime;
	}

	finish(now) {
		updateValue(this, 'endTime', now || new Date());
	}

	sleep(sleepTime) {
		updateValue(this, 'sleepTime', sleepTime || new Date());
	}

	wakeUp(now) {
		updateValue(this, 'startTime', now || new Date());
		updateValue(this, 'sleepTime', null);
	}

	stop(data) {
		this.updateData(data);
		this.finish();
	}

	onHeartBeat() {
		updateValue(this, 'heartBeatCount', this.heartBeatCount + 1);
	}

	shouldUpdate() {
		// ignoring this.suspended because these events finish on suspend
		return (
			this.heartBeatCount >= this.updatedCount ||
			this.endTime ||
			this.sleepTime
		);
	}

	suspend(now) {
		updateValue(this, 'suspended', true);
		this.finish(now);
	}

	resume(now) {
		updateValue(this, 'suspended', false);
		updateValue(this, 'startTime', now || new Date());
		if (this.isFinished()) {
			logger.debug(
				'Resuming an already-finished event. Resetting (removing) event endTime'
			);
			updateValue(this, 'endTime', null);
		}
		updateValue(this, 'updatedCount', 0);
		updateValue(this, 'heartBeatCount', 0);
	}
}
