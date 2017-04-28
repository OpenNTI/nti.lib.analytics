import {isNTIID} from 'nti-lib-ntiids';
import {definePublic, updateValue} from 'nti-commons';

import {WATCH_VIDEO} from '../MimeTypes';

import Base from './abstract/Base';

export default class WatchVideoEvent extends Base {

	constructor (resourceId, rootContextId, context, videoStartTime, maxDuration, hasTranscript) {
		super(WATCH_VIDEO, rootContextId || (context || []).find(elem => isNTIID(elem)) || void 0);

		Object.defineProperties(this, {
			...definePublic({
				'MaxDuration': maxDuration,
				'resource_id': resourceId,
				'context_path': context,
				'video_end_time': null,
				'video_start_time': videoStartTime,
				'with_transcript': !!hasTranscript
			})
		});
	}


	finish (videoEndTime, eventEndTime = Date.now()) {
		super.finish(eventEndTime);

		updateValue(this, 'video_end_time',
			// if this event is being halted (analytics store can do this on beforeunload, etc.)
			// we won't have a videoEndTime. best-guess it based on the duration (time_length) of this event.
			videoEndTime || (this['video_start_time'] + this['time_length']));
	}
}
