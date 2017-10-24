import Base from './Base';

export default class TimedAnalyticEvent extends Base {
	static makeFactory (manager) {
		const {EventType, Name, Immediate} = this;

		function findMatch (resourceID) {
			return manager.findEvent(e => e.type === EventType && e.resourceID === resourceID);
		}

		return {
			[Name]: {
				start: (resourceID, data) => {
					const event = new this(EventType, resourceID, data, manager);

					manager.pushEvent(event, Immediate);
				},

				stop: (resourceID, data) => {
					const event = findMatch(resourceID);

					if (!event) {
						throw new Error('Cannot stop an event that hasn\'t been started.');
					}

					event.stop(data);
				}
			}
		};
	}



	constructor (type, resourceID, data, manager) {
		super(type, resourceID, data, manager);

		this.heartBeatCount = 0;
		this.updatedCount = 0;
	}


	onDataSent () {
		this.updatedCount += 1;
		this.heartBeatCount = 0;
	}


	isFinished () {
		return !!this.endTime;
	}


	stop (data) {
		this.endTime = new Date();
	}


	onHeartBeat () {
		this.heartBeatCount += 1;
	}


	shouldUpdate () {
		this.heartBeatCount >= this.updatedCount || this.endTime;
	}
}
