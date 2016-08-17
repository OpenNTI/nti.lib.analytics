import AssignmentEvent from '../AssignmentEvent';
import {ASSIGNMENT_VIEWED} from '../../MimeTypes';

describe('Event: AssignmentEvent', () => {

	beforeEach(() => jasmine.clock().install());

	afterEach(() => jasmine.clock().uninstall());

	it ('Basic Shape: Adds ResourceId?? and ContentId, as well sets correct MimeType', () => {
		jasmine.clock().mockDate();
		const now = Date.now();
		const course = 'dude';
		const ResourceId = 'abc';
		const ContentId = 'xyz';
		const event = new AssignmentEvent(ContentId, course, ResourceId);

		expect(event.getData()).toEqual({
			startTime: now,
			MimeType: ASSIGNMENT_VIEWED,
			RootContextID: course,
			course,
			ResourceId,
			ContentId
		});

		expect(JSON.stringify(event)).toBe(`{"startTime":${now},"MimeType":"${ASSIGNMENT_VIEWED}","RootContextID":"${course}","course":"${course}","ResourceId":"${ResourceId}","ContentId":"${ContentId}"}`);

		event.finish();
		expect(Object.keys(event.getData()).includes('time_length')).toBeTruthy();
		expect(Object.keys(event.getData()).includes('timestamp')).toBeTruthy();
		expect(event.heartbeat).toBeFalsy();
	});
});
