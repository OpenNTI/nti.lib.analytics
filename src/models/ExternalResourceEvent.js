import ResourceEvent from './ResourceEvent';

export default class ExternalResourceEvent extends ResourceEvent {
	constructor (resourceId, courseId, contextPath) {
		super(resourceId, courseId);

		if (contextPath) {
			this.setContextPath(contextPath);
		}

		this.finish();
		delete this.time_length;
	}
}
