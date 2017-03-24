import {RESOURCE_VIEWED} from '../MimeTypes';
import {definePublic} from '../utils';

import Base from './abstract/Base';

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
