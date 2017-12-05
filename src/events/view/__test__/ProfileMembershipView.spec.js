/* eslint-env jest */
import {Date as DateUtil} from 'nti-commons';

import Event from '../ProfileMembershipView';

const now = new Date('Dec 05 2017 12:00:00 GMT-0600 (CST)');

describe('ProfileMembershipView Event', () => {

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
			context: ['1:2:3'],
		});

		expect(event.getData()).toEqual({
			'MimeType': 'application/vnd.nextthought.analytics.profilemembershipviewevent',
			'ProfileEntity': 'id',
			'ResourceId': 'id',
			'RootContextID': '1:2:3',
			'context_path': ['1:2:3'],
			'timelength': 0,
			'timestamp': now.getTime() / 1000,
			'user': 'foobar',
		});
	});

});