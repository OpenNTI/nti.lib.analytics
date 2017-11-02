import Base from '../abstract/Base';
import {register} from '../Registry';

@register('ExternalResourceView')
export default class ExternalResourceView extends Base {
	static EventType = 'application/vnd.nextthought.analytics.resourceevent';
}
