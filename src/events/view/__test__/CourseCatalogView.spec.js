/* eslint-env jest */
import { Date as DateUtil } from '@nti/lib-commons';

import Event from '../CourseCatalogView';

const now = new Date('Dec 05 2017 12:00:00 GMT-0600 (CST)');

describe('CourseCatalogView Event', () => {
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
		});

		expect(event.getData()).toEqual({
			MimeType:
				'application/vnd.nextthought.analytics.coursecatalogviewevent',
			ResourceId: 'id',
			RootContextID: 'id',
			context_path: [],
			Duration: 0,
			timestamp: now.getTime() / 1000,
			user: 'foobar',
		});
	});
});
