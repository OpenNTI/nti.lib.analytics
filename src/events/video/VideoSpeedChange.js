import Base from '../abstract/Base';
import {register} from '../Registry';

class VideoSpeedChange extends Base {
	static EventType = 'application/vnd.nextthought.analytics.videoplayspeedchange'

	video = true

	getData () {
		const {data} = this;
		const output = super.getData();

		return {
			...output,
			OldPlaySpeed: data.oldPlaySpeed,
			NewPlaySpeed: data.newPlaySpeed,
			VideoTime: data.videoTime
		};
	}
}

export default register('VideoSpeedChange', VideoSpeedChange);
