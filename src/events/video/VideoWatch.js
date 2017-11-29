import Timed from '../abstract/Timed';
import {register} from '../Registry';

export function getBaseVideoData (data) {
	return {
		'with_transcript': data.withTranscript,
		'video_start_time': data.videoStartTime,
		'video_end_time': data.videoEndTime,
		'time_length': Math.abs(data.videoEndTime - data.videoStartTime) || null,
	};
}

@register('VideoWatch')
export default class VideoWatch extends Timed {
	static EventType = 'application/vnd.nextthought.analytics.watchvideoevent'

	getData () {
		const {data} = this;
		const output = super.getData();

		return {
			...output,
			...getBaseVideoData(data),
			'MaxDuration': data.duration,
			'PlaySpeed': data.playSpeed
		};
	}

	//since the video end time is constantly updating
	//we should update as long as we aren't suspended
	shouldUpdate () {
		return !this.suspended;
	}
}
