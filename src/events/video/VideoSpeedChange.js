import Base from '../abstract/Base';
import {register} from '../Registry';

@register('VideoSpeedChange')
export default class VideoSpeedChange extends Base {
	static EventType = 'application/vnd.nextthought.analytics.videoplayspeedchange'

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