/* eslint-env jest */
import { Date as DateUtil } from '@nti/lib-commons';

import Event from '../VideoSpeedChange';

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
			videoTime: 50,
			newPlaySpeed: 2,
			oldPlaySpeed: 1,
		});

		expect(event.getData()).toEqual({
			MimeType:
				'application/vnd.nextthought.analytics.videoplayspeedchange',
			NewPlaySpeed: 2,
			OldPlaySpeed: 1,
			ResourceId: 'id',
			RootContextID: '1:2:3',
			VideoTime: 50,
			context_path: [],
			timestamp: now.getTime() / 1000,
			user: 'foobar',
		});
	});
});
