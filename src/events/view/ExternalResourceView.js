import Base from '../abstract/Base';
import {register} from '../Registry';

class ExternalResourceView extends Base {
	static EventType = 'application/vnd.nextthought.analytics.resourceevent';
}

export default register('ExternalResourceView', ExternalResourceView);
