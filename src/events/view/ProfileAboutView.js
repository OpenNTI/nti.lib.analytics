import Timed from '../abstract/Timed';
import {register} from '../Registry';

@register('ProfileAboutView')
export default class ProfileAboutView extends Timed {
	static EventType = 'application/vnd.nextthought.analytics.profileviewevent'

	getData () {
		const data = super.getData();

		return {
			...data,
			ProfileEntity: this.resourceId
		};
	}
}
