import WatchVideoEvent from '../WatchVideoEvent';
import {WATCH_VIDEO} from '../../MimeTypes';

describe('Event: WatchVideoEvent', () => {

	beforeEach(() => jasmine.clock().install());

	afterEach(() => jasmine.clock().uninstall());

	it ('Basic Shape: Adds video fields and sets correct MimeType', () => {
		jasmine.clock().mockDate();
		const now = Date.now();
		const course = 'dude';
		const resourceId = 'abc';
		const context = ['a','tag:nextthought.com,2011-10:NextThought-HTML-JanuxFAQ.janux_faq','c'];
		const videoStartTime = Date.now();
		const maxDuration = 1;
		const hasTranscript = true;
		const event = new WatchVideoEvent(resourceId, course, context, videoStartTime, maxDuration, hasTranscript);

		const expected = {
			startTime: now,
			MimeType: WATCH_VIDEO,
			RootContextID: context[1],
			course,
			'context_path': context,
			MaxDuration: maxDuration,
			'resource_id': resourceId,
			'video_start_time': videoStartTime,
			'with_transcript': hasTranscript
		};

		expect(event.getData()).toEqual(expected);

		expect(JSON.stringify(event)).toBe(`
			{
				"startTime":${now},
				"MimeType":"${WATCH_VIDEO}",
				"RootContextID":"${context[1]}",
				"course":"${course}",
				"MaxDuration":${maxDuration},
				"resource_id":"${resourceId}",
				"context_path":${JSON.stringify(context)},
				"video_start_time":${now},
				"with_transcript":${hasTranscript}
			}
		`.trim().replace(/[\s\t\r\n]+/g,''));

		jasmine.clock().tick(10000);
		event.finish();
		expect(Object.keys(event.getData()).includes('time_length')).toBeTruthy();
		expect(Object.keys(event.getData()).includes('timestamp')).toBeTruthy();
		expect(Object.keys(event.getData()).includes('video_end_time')).toBeTruthy();
		expect(event.heartbeat).toBeFalsy();
	});
});
