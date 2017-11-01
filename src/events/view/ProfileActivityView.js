import Timed from '../abstract/Timed';
import {register} from '../Registry';

@register('ProfileActivityView')
export default class ProfileActivityView extends Timed {
	static EventType = 'application/vnd.nextthought.analytics.profileactivityviewevent'

	getData () {
		const data = super.getData();

		return {
			...data,
			ProfileEntity: this.resourceID
		};
	}
}
