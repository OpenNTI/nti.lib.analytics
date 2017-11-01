import Timed from '../abstract/Timed';
import {register} from '../Registry';

@register('ResourceView')
export default class ResourceView extends Timed {
	static EventType = 'application/vnd.nextthought.analytics.resourceevent'
}
