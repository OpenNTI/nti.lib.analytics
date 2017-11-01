import Timed from '../abstract/Timed';
import {register} from '../Registry';

@register('TopicView')
export default class TopicView extends Timed {
	static EventType = 'application/vnd.nextthought.analytics.topicviewevent'

	getData () {
		const data = this.getData();

		return {
			...data,
			'topic_id': this.resourceID
		};
	}
}
