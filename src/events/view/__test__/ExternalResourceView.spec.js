/* eslint-env jest */
import {Date as DateUtil} from '@nti/lib-commons';

import Event from '../ExternalResourceView';

const now = new Date('Dec 05 2017 12:00:00 GMT-0600 (CST)');

describe('ExternalResourceView Event', () => {

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
			context: ['1:2:3'],
		});

		expect(event.getData()).toEqual({
			'MimeType': 'application/vnd.nextthought.analytics.resourceevent',
			'ResourceId': 'id',
			'RootContextID': '1:2:3',
			'context_path': ['1:2:3'],
			'timestamp': now.getTime() / 1000,
			'user': 'foobar',
		});
	});

});
