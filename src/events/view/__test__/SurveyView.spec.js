/* eslint-env jest */
import {Date as DateUtil} from 'nti-commons';

import Event from '../SurveyView';

const now = new Date('Dec 05 2017 12:00:00 GMT-0600 (CST)');

describe('SurveyView Event', () => {

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
			contentId: 'content-id'
		});

		expect(event.getData()).toEqual({
			'ContentId': 'content-id',
			// 'MimeType': 'application/vnd.nextthought.analytics.surveyviewevent',
			'MimeType': 'application/vnd.nextthought.analytics.selfassessmentviewevent',
			'ResourceId': 'id',
			'RootContextID': '1:2:3',
			'context_path': ['1:2:3'],
			'timelength': 0,
			'timestamp': now.getTime() / 1000,
			'user': 'foobar',
		});
	});

});
