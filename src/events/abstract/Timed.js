import {defineProtected, updateValue} from 'nti-commons';
import Logger from 'nti-util-logger';

import Base from './Base';

const logger = Logger.get('analytics:event');

export default class TimedAnalyticEvent extends Base {
	static makeFactory (manager) {
		const Type = this;
		const {EventType, Immediate} = this;

		return {
			start: (resourceId, data) => {
				try {
					const event = new Type(EventType, resourceId, data, manager);

					manager.pushEvent(event, Immediate);
				} catch (e) {
					logger.error('Could not start event, because: %s', e.stack || e.message || e);
				}
			},

			stop: (resourceId, data) => {
				try {
					const event = this.findActiveEvent(manager, resourceId);

					if (!event) {
						throw new Error('Cannot stop an event that hasn\'t been started.');
					}

					event.stop(data);
				} catch (e) {
					logger.error('Could not stop event, because: %s', e.stack || e.message || e);
				}
			},

			update: (resourceId, data) => {
				try {
					const event = this.findActiveEvent(manager, resourceId);

					if (!event) {
						throw new Error('Cannot update an event that hasn\'t been started.');
					}

					event.updateData(data);
				} catch (e) {
					logger.error('Could not update event, because: %s', e.stack || e.message || e);
				}
			}
		};
	}



	constructor (type, resourceId, data, manager) {
		super(type, resourceId, data, manager);

		Object.defineProperties(this, {
			...defineProtected({
				heartBeatCount: 0,
				updatedCount: 0,
				endTime: null,
				suspended: false
			})
		});

	}


	getData () {
		const data = super.getData();
		const {startTime} = this;
		const endTime = this.endTime || new Date();

		return {
			...data,
			timelength: (endTime - startTime) / 1000
		};
	}


	onDataSent () {
		updateValue(this, 'updatedCount', Math.min((this.updatedCount + 1), 6));
		updateValue(this, 'heartBeatCount', 0);
	}


	isFinished () {
		return !!this.endTime;
	}


	stop (data) {
		this.updateData(data);

		updateValue(this, 'endTime', new Date());
	}


	onHeartBeat () {
		updateValue(this, 'heartBeatCount', this.heartBeatCount + 1);
	}


	shouldUpdate () {
		return !this.suspended && (this.heartBeatCount >= this.updatedCount || this.endTime);
	}


	suspend () {
		updateValue(this, 'suspended', true);
	}


	resume () {
		updateValue(this, 'suspended', false);
		updateValue(this, 'startTime', new Date());
		updateValue(this, 'updatedCount', 0);
		updateValue(this, 'heartBeatCount', 0);
	}
}
