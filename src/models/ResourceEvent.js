import Base from './abstract/Base';
import {RESOURCE_VIEWED} from '../MimeTypes';
import {definePublic} from '../utils';

export default class ResourceEvent extends Base {
	constructor (resourceId, rootContextID) {
		super(RESOURCE_VIEWED, rootContextID);

		Object.defineProperties(this, {
			...definePublic({
				'resource_id': resourceId
			})
		});
	}
}
