import Timed from '../abstract/Timed';
import { register } from '../Registry';

class ProfileAboutView extends Timed {
	static EventType = 'application/vnd.nextthought.analytics.profileviewevent';

	getData() {
		const data = super.getData();

		return {
			...data,
			ProfileEntity: this.resourceId,
		};
	}
}

export default register('ProfileAboutView', ProfileAboutView);
