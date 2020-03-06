import Timed from '../abstract/Timed';
import {register} from '../Registry';

export function getBaseVideoData (data) {
	const endTime = data.videoEndTime ?? data.videoTime ?? data.videoStartTime;

	return {
		'player_configuration': data['player_configuration'],
		'with_transcript': data.withTranscript || false,
		'video_start_time': data.videoStartTime,
		'video_end_time': data.videoEndTime,
		'Duration': Math.abs(endTime - data.videoStartTime) || null,
	};
}

@register('VideoWatch')
export default class VideoWatch extends Timed {
	static EventType = 'application/vnd.nextthought.analytics.watchvideoevent'

	video = true

	getData () {
		const {data} = this;
		const output = super.getData();

		return {
			...output,
			...getBaseVideoData(data),
			'MaxDuration': data.duration,
			'PlaySpeed': data.playSpeed || 1
		};
	}

	//since the video end time is constantly updating
	//we should update as long as we aren't suspended
	shouldUpdate () {
		return !this.suspended;
	}
}
