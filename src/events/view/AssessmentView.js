import Timed from '../abstract/Timed';
import { register } from '../Registry';

class AssessmentView extends Timed {
	static EventType =
		'application/vnd.nextthought.analytics.selfassessmentviewevent';

	getData() {
		const data = super.getData();

		return {
			...data,
			ContentId:
				this.data.contentId ||
				/* istanbul ignore next */
				this.data.ContentID,
		};
	}
}

export default register('AssessmentView', AssessmentView);
