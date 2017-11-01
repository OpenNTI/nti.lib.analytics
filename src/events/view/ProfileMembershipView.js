import Timed from '../abstract/Timed';
import {register} from '../Registry';

@register('ProfileMembershipView')
export default class ProfileMembershipView extends Timed {
	static EventType = 'application/vnd.nextthought.analytics.profilemembershipviewevent'

	getData () {
		const data = super.getData();

		return {
			...data,
			ProfileEntity: this.resourceID
		};
	}
}
