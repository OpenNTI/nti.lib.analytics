/* eslint-env jest */
import {Date as DateUtils} from 'nti-commons';

import WatchVideoEvent from '../WatchVideoEvent';
import {WATCH_VIDEO} from '../../MimeTypes';

describe('Event: WatchVideoEvent', () => {

	beforeEach(() => jest.useFakeTimers());

	afterEach(() => {
		DateUtils.MockDate.uninstall();
		jest.useRealTimers();
	});

	test ('Basic Shape: Adds video fields and sets correct MimeType', () => {
		DateUtils.MockDate.install();
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
			RootContextID: course,
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
				"RootContextID":"${course}",
				"context_path":${JSON.stringify(context)},
				"MaxDuration":${maxDuration},
				"resource_id":"${resourceId}",
				"video_start_time":${now},
				"with_transcript":${hasTranscript}
			}
		`.trim().replace(/[\s\t\r\n]+/g,''));

		jest.runTimersToTime(10000);
		event.finish();
		expect(Object.keys(event.getData()).includes('time_length')).toBeTruthy();
		expect(Object.keys(event.getData()).includes('timestamp')).toBeTruthy();
		expect(Object.keys(event.getData()).includes('video_end_time')).toBeTruthy();
		expect(event.heartbeat).toBeFalsy();
	});
});
