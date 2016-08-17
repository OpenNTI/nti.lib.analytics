import Base from './abstract/Base';
import {RESOURCE_VIEWED} from '../MimeTypes';
import {definePublic} from '../utils';

export default class ResourceEvent extends Base {
	constructor (resourceId, courseId) {
		super(RESOURCE_VIEWED, null, courseId);

		Object.defineProperties(this, {
			...definePublic({
				'resource_id': resourceId
			})
		});
	}
}
