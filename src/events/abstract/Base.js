export default class BaseAnalyticEvent {
	static EventType = ''
	static Immediate = true

	static makeFactory (manager) {
		return {
			//Making this async so any errors don't interrupt the caller
			send: async (resourceID, data) => {
				const event = new this(this.EventType, resourceID, data, manager);

				manager.pushEvent(event, this.Immediate);
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
		this.data = {...this.data, ...data};
	}


	getData () {
		//TODO: fill this out
	}


	onDataSent () {
		this.dataSent = true;
	}


	isFinished () { return dataSent; }
}
