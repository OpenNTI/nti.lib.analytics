import Timed from '../abstract/Timed';
import {register} from '../Registry';

@register('ThoughtView')
export default class ThoughtView extends Timed {
	static EventType = 'application/vnd.nextthought.analytics.blogviewevent'

	getData () {
		const data = super.getData();

		return {
			...data,
			'topic_id': this.resourceId
		};
	}
}
