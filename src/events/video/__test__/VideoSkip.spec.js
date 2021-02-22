/* eslint-env jest */
import { Date as DateUtil } from '@nti/lib-commons';

import Event from '../VideoSkip';

const now = new Date('Dec 05 2017 12:00:00 GMT-0600 (CST)');

describe('VideoWatch Event', () => {
	afterEach(() => {
		DateUtil.MockDate.uninstall();
	});

	beforeEach(() => {
		DateUtil.MockDate.install(now);
	});

	test('Verify Factory Shape', () => {
		const factory = Event.makeFactory({});

		expect(factory).toEqual({
			send: expect.any(Function),
		});
	});

	test('Verify data shape', () => {
		const event = new Event(Event.EventType, 'id', {
			user: 'foobar',
			rootContextId: '1:2:3',
			duration: 123,
			videoStartTime: 50,
		});

		expect(event.getData()).toEqual({
			MimeType: 'application/vnd.nextthought.analytics.skipvideoevent',
			ResourceId: 'id',
			RootContextID: '1:2:3',
			context_path: [],
			Duration: null,
			timestamp: now.getTime() / 1000,
			user: 'foobar',
			video_end_time: undefined,
			video_start_time: 50,
			with_transcript: false,
		});
	});
});
