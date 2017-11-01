import {defineProtected, updateValue} from 'nti-commons';

import Base from './Base';

export default class TimedAnalyticEvent extends Base {
	static makeFactory (manager) {
		const Type = this;
		const {EventType, Immediate} = this;

		function findMatch (resourceID) {
			return manager.findActiveEvent(e => e.type === EventType && e.resourceID === resourceID);
		}

		return {
			//Making this async so any errors don't interrupt the caller
			start: async (resourceID, data) => {
				const event = new Type(EventType, resourceID, data, manager);

				manager.pushEvent(event, Immediate);
			},

			stop: async (resourceID, data) => {
				const event = findMatch(resourceID);

				if (!event) {
					throw new Error('Cannot stop an event that hasn\'t been started.');
				}

				event.stop(data);
			}
		};
	}



	constructor (type, resourceID, data, manager) {
		super(type, resourceID, data, manager);

		Object.defineProperties({
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
		updateValue(this, 'updatedCount', this.updatedCount + 1);
		updateValue(this, 'heartBeatCount', 0);
	}


	isFinished () {
		return !!this.endTime;
	}


	stop (data) {
		this.updateData(data);

		updateValue(this, 'endTime', new Date());

		this.endTime = new Date();
	}


	onHeartBeat () {
		updateValue(this, 'heartBeatCount', this.heartBeatCount + 1);
		this.heartBeatCount += 1;
	}


	shouldUpdate () {
		!this.suspended && (this.heartBeatCount >= this.updatedCount || this.endTime);
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
