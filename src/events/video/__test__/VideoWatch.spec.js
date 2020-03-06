/* eslint-env jest */
import {Date as DateUtil} from '@nti/lib-commons';

import Event from '../VideoWatch';

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
			start: expect.any(Function),
			stop: expect.any(Function),
			update: expect.any(Function),
		});
	});

	test('Verify data shape', () => {

		const event = new Event(Event.EventType, 'id', {
			user: 'foobar',
			rootContextId: '1:2:3',
			duration: 123,
			videoStartTime: 0
		});

		expect(event.shouldUpdate()).toBe(true);

		expect(event.getData()).toEqual({
			'MaxDuration': 123,
			'MimeType': 'application/vnd.nextthought.analytics.watchvideoevent',
			'PlaySpeed': 1,
			'ResourceId': 'id',
			'RootContextID': '1:2:3',
			'context_path': [],
			'Duration': null,
			'timestamp': now.getTime() / 1000,
			'user': 'foobar',
			'video_end_time': undefined,
			'video_start_time': 0,
			'with_transcript': false,
		});


		event.updateData({videoEndTime: 100});


		expect(event.getData()).toEqual({
			'MaxDuration': 123,
			'MimeType': 'application/vnd.nextthought.analytics.watchvideoevent',
			'PlaySpeed': 1,
			'ResourceId': 'id',
			'RootContextID': '1:2:3',
			'context_path': [],
			'Duration': 100,
			'timestamp': now.getTime() / 1000,
			'user': 'foobar',
			'video_end_time': 100,
			'video_start_time': 0,
			'with_transcript': false,
		});
	});

});
