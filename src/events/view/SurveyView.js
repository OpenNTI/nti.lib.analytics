import Timed from '../abstract/Timed';
import {register} from '../Registry';

@register('SurveyView')
export default class SurveyView extends Timed {
	static EventType = 'application/vnd.nextthought.analytics.surveyviewevent'

	getData () {
		const data = super.getData();

		return {
			...data,
			ContentId: this.data.contentId || this.data.ContentID
		};
	}
}
