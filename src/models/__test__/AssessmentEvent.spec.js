/* eslint-env jest */
import {Date as DateUtils} from 'nti-commons';

import AssessmentEvent from '../AssessmentEvent';
import {SELFASSESSMENT_VIEWED, ASSIGNMENT_VIEWED} from '../../MimeTypes';

describe('Event: AssessmentEvent', () => {

	beforeEach(() => jest.useFakeTimers());

	afterEach(() => {
		DateUtils.MockDate.uninstall();
		jest.useRealTimers();
	});

	test ('Basic Shape: Adds ResourceId?? and ContentId, as well sets correct MimeType', () => {
		DateUtils.MockDate.install();
		const now = Date.now();
		const course = 'dude';
		const ResourceId = 'abc';
		const ContentId = 'xyz';
		const event = new AssessmentEvent(ContentId, course, ResourceId);

		expect(event.getData()).toEqual({
			startTime: now,
			MimeType: SELFASSESSMENT_VIEWED,
			RootContextID: course,
			ResourceId,
			ContentId
		});

		expect(JSON.stringify(event)).toBe(`{"startTime":${now},"MimeType":"${SELFASSESSMENT_VIEWED}","RootContextID":"${course}","ResourceId":"${ResourceId}","ContentId":"${ContentId}"}`);

		event.finish();
		expect(Object.keys(event.getData()).includes('time_length')).toBeTruthy();
		expect(Object.keys(event.getData()).includes('timestamp')).toBeTruthy();
		expect(event.heartbeat).toBeFalsy();
	});

	test ('MimeType override', () => {
		DateUtils.MockDate.install();
		const now = Date.now();
		const course = 'dude';
		const ResourceId = 'abc';
		const ContentId = 'xyz';
		const event = new AssessmentEvent(ContentId, course, ResourceId, ASSIGNMENT_VIEWED);

		expect(event.getData()).toEqual({
			startTime: now,
			MimeType: ASSIGNMENT_VIEWED,
			RootContextID: course,
			ResourceId,
			ContentId
		});

		expect(JSON.stringify(event)).toBe(`{"startTime":${now},"MimeType":"${ASSIGNMENT_VIEWED}","RootContextID":"${course}","ResourceId":"${ResourceId}","ContentId":"${ContentId}"}`);

		event.finish();
		expect(Object.keys(event.getData()).includes('time_length')).toBeTruthy();
		expect(Object.keys(event.getData()).includes('timestamp')).toBeTruthy();
		expect(event.heartbeat).toBeFalsy();
	});
});
