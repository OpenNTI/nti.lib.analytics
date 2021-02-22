import Timed from '../abstract/Timed';
import { register } from '../Registry';

class ResourceView extends Timed {
	static EventType = 'application/vnd.nextthought.analytics.resourceevent';
}

export default register('ResourceView', ResourceView);
