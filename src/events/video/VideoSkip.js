import Base from '../abstract/Base';
import {register} from '../Registry';

import {getBaseVideoData} from './VideoWatch';

class VideoSkip extends Base {
	static EventType = 'application/vnd.nextthought.analytics.skipvideoevent'

	video = true

	getData () {
		const {data} = this;
		const output = super.getData();

		return {
			...output,
			...getBaseVideoData(data)
		};
	}
}

export default register('VideoSkip', VideoSkip);
