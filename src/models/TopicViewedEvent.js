import {definePublic} from 'nti-commons';

import {TOPIC_VIEWED} from '../MimeTypes';

import Base from './abstract/Base';

export default class TopicViewedEvent extends Base {
	constructor (topicId, rootContextID, startTime) {
		super(TOPIC_VIEWED, rootContextID, startTime);

		Object.defineProperties(this, {
			...definePublic({
				'topic_id': topicId
			})
		});
	}
}
