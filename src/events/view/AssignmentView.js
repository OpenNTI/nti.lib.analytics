import Timed from '../abstract/Timed';
import {register} from '../Registry';

@register('AssignmentView')
export default class AssignmentView extends Timed {
	static EventType = 'application/vnd.nextthought.analytics.assignmentviewevent'

	getData () {
		const data = super.getData();

		return {
			...data,
			ContentId: this.data.contentId || this.data.ContentID
		};
	}
}
