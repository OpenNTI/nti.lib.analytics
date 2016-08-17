import Base from './abstract/Base';
import {TOPIC_VIEWED} from '../MimeTypes';
import {definePublic} from '../utils';

export default class TopicViewedEvent extends Base {
	constructor (topicId, courseId, startTime) {
		super(TOPIC_VIEWED, null, courseId, startTime);

		Object.defineProperties(this, {
			...definePublic({
				'topic_id': topicId
			})
		});
	}
}
