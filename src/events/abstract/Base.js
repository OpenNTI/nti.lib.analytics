import {defineProtected, updateValue} from 'nti-commons';
import Logger from 'nti-util-logger';

const logger = Logger.get('analytics:event');

export default class BaseAnalyticEvent {
	static EventType = ''
	static Immediate = true

	static findActiveEvent (manager, resourceId) {
		return manager.findActiveEvent(e => e.type === this.EventType && e.resourceId === resourceId);
	}

	static makeFactory (manager) {
		const Type = this;

		return {
			send: (resourceId, data) => {
				try {
					const event = new Type(this.EventType, resourceId, data || {}, manager);

					manager.pushEvent(event, this.Immediate);

				} catch (e) {
					logger.error('Could not send event because: %o', e.stack || e.message || e);
				}
			}
		};
	}


	constructor (type, resourceId, data = {}, manager = {}) {
		const context = data.context || manager.context || [];

		Object.defineProperties(this, {
			...defineProtected({
				manager,
				type,
				resourceId,
				startTime: new Date(),
				data: {...data},
				context: context,
				RootContextID: data.RootContextID || data.rootContextId || context[0] || '',
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
			RootContextID: this.RootContextID,
			timestamp: this.startTime.getTime() / 1000, //send seconds back
			user: this.user,
			ResourceId: this.resourceId,
		};
	}


	onDataSent () {
		this.dataSent = true;
	}


	isFinished () { return this.dataSent; }
}