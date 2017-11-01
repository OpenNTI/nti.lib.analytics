import {defineProtected, updateValue} from 'nti-commons';

export default class BaseAnalyticEvent {
	static EventType = ''
	static Immediate = true

	static makeFactory (manager) {
		return {
			//Making this async so any errors don't interrupt the caller
			send: async (resourceID, data) => {
				const event = new this(this.EventType, resourceID, data || {}, manager);

				manager.pushEvent(event, this.Immediate);
			}
		};
	}


	constructor (type, resourceID, data, manager) {

		Object.defineProperties({
			...defineProtected({
				manager,
				type,
				resourceID,
				startTime: new Date(),
				data: {...data},
				context: data.context || manager.getContext(),
				RootContextID: data.RootContextID || manager.getRootContextID(),
				user: data.user || manager.getUser()
			})
		});

		this.manager = manager;
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
			ResourceID: this.resourceID,
		};
	}


	onDataSent () {
		this.dataSent = true;
	}


	isFinished () { return this.dataSent; }
}
