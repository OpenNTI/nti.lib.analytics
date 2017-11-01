import Timed from '../abstract/Timed';
import {register} from '../Registry';

@register('CourseCatalogView')
export default class CourseCatalogView extends Timed {
	static EventType = 'application/vnd.nextthought.analytics.coursecatalogviewevent'

	getData () {
		const data = super.getData();

		return {
			...data,
			RootContextID: this.resouceID
		};
	}
}
