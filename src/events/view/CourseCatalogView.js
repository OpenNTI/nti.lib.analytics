import Timed from '../abstract/Timed';
import {register} from '../Registry';

class CourseCatalogView extends Timed {
	static EventType = 'application/vnd.nextthought.analytics.coursecatalogviewevent'

	constructor (type, resourceId, data, manager) {
		super(
			type,
			resourceId,
			{
				...(
					/* istanbul ignore next */
					data || {}
				),
				rootContextId: resourceId
			},
			manager
		);
	}
}

export default register('CourseCatalogView', CourseCatalogView);
