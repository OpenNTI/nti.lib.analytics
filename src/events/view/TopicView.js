import Timed from '../abstract/Timed';
import { register } from '../Registry';

class TopicView extends Timed {
	static EventType = 'application/vnd.nextthought.analytics.topicviewevent';

	getData() {
		const data = super.getData();

		return {
			...data,
			topic_id: this.resourceId,
		};
	}
}

export default register('TopicView', TopicView);
