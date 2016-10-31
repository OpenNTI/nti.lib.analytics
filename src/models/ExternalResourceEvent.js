import ResourceEvent from './ResourceEvent';

export default class ExternalResourceEvent extends ResourceEvent {
	constructor (resourceId, rootContextID, contextPath) {
		super(resourceId, rootContextID);

		if (contextPath) {
			this.setContextPath(contextPath);
		}

		this.finish();
		delete this.time_length;
	}
}
