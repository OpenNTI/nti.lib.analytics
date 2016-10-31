import AssessmentEvent from '../AssessmentEvent';
import {SELFASSESSMENT_VIEWED, ASSIGNMENT_VIEWED} from '../../MimeTypes';

describe('Event: AssessmentEvent', () => {

	beforeEach(() => jasmine.clock().install());

	afterEach(() => jasmine.clock().uninstall());

	it ('Basic Shape: Adds ResourceId?? and ContentId, as well sets correct MimeType', () => {
		jasmine.clock().mockDate();
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

	it ('MimeType override', () => {
		jasmine.clock().mockDate();
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
