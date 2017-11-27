import {defineProtected, updateValue} from 'nti-commons';
import Logger from 'nti-util-logger';

const logger = Logger.get('analytics:event');

export default class BaseAnalyticEvent {
	static EventType = ''
	static Immediate = true

	static findActiveEvent (manager, resourceID) {
		return manager.findActiveEvent(e => e.type === this.EventType && e.resourceID === resourceID);
	}

	static makeFactory (manager) {
		const Type = this;

		return {
			send: (resourceID, data) => {
				try {
					const event = new Type(this.EventType, resourceID, data || {}, manager);

					manager.pushEvent(event, this.Immediate);

				} catch (e) {
					logger.error('Could not send event because: %o', e.stack || e.message || e);
				}
			}
		};
	}


	constructor (type, resourceID, data = {}, manager = {}) {
		const context = data.context || manager.context || [];

		Object.defineProperties(this, {
			...defineProtected({
				manager,
				type,
				resourceID,
				startTime: new Date(),
				data: {...data},
				context: context,
				RootContextID: data.RootContextID || context[0] || '',
				user: data.user || manager.user
			})
		});
	}


	updateData (data) {
		updateValue(this, 'data', {...this.data, ...data});
	}


	getData () {
		return {
			MimeType: this.type,
			'context_path': this.context,
			RootContextId: this.RootContextID,
			timestamp: this.startTime.getTime() / 1000, //send seconds back
			user: this.user,
			ResourceId: this.resourceID,
		};
	}


	onDataSent () {
		this.dataSent = true;
	}


	isFinished () { return this.dataSent; }
}
