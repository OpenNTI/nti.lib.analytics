import Timed from '../abstract/Timed';
import {register} from '../Registry';

@register('AssessmentView')
export default class AssessmentView extends Timed {
	static EventType = 'application/vnd.nextthought.analytics.selfassessmentviewevent'

	getData () {
		const data = super.getData();

		return {
			...data,
			ContentId: this.data.ContentID
		};
	}
}
