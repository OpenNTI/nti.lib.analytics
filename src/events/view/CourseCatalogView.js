import Timed from '../abstract/Timed';
import {register} from '../Registry';

@register('CourseCatalogView')
export default class CourseCatalogView extends Timed {
	static EventType = 'application/vnd.nextthought.analytics.coursecatalogviewevent'

	constructor (type, resourceId, data = {}, manager) {
		super(type, resourceId, {...data, rootContextId: resourceId}, manager);
	}
}
