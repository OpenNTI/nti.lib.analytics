export default class BaseAnalyticEvent {
	static EventType = ''
	static Name = ''
	static Immediate = true

	static makeFactory (manager) {
		return {
			[this.NAME]: {
				send: (resourceID, data) => {
					const event = new this(this.EventType, resourceID, data, manager);

					manager.pushEvent(event, this.Immediate);
				}
			}
		};
	}


	constructor (type, resourceID, data, manager) {
		const {context, RootContextID, user} = data;

		this.manager = manager;


		this.type = type;
		this.resourceID = resourceID;

		this.startTime = new Date();

		this.data = {...this.data};

		this.context = context || [];//TODO: get this if its not provided
		this.RootContextID = RootContextID || context[0] || ''; //TODO: fill this in
		this.user = user || null;//TODO: fill this in
	}


	updateData (data) {
		this.data = {...this.data,...data};
	}


	getData () {
		//TODO: fill this out
	}


	isFinished () {
		return true;
	}


}
