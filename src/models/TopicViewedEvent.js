import Base from './abstract/Base';
import {TOPIC_VIEWED} from '../MimeTypes';
import {definePublic} from '../utils';

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
