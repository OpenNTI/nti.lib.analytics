import ResourceEvent from '../ResourceEvent';
import {RESOURCE_VIEWED} from '../../MimeTypes';

describe('Event: ResourceEvent', () => {

	beforeEach(() => jasmine.clock().install());

	afterEach(() => jasmine.clock().uninstall());

	it ('Basic Shape: Adds resource_id and sets correct MimeType', () => {
		jasmine.clock().mockDate();
		const now = Date.now();
		const course = 'dude';
		const resourceId = 'abc';
		const event = new ResourceEvent(resourceId, course);

		expect(event.getData()).toEqual({
			startTime: now,
			MimeType: RESOURCE_VIEWED,
			RootContextID: course,
			course,
			'resource_id': resourceId
		});

		expect(JSON.stringify(event)).toBe(`{"startTime":${now},"MimeType":"${RESOURCE_VIEWED}","RootContextID":"${course}","course":"${course}","resource_id":"${resourceId}"}`);

		event.finish();
		expect(Object.keys(event.getData()).includes('time_length')).toBeTruthy();
		expect(Object.keys(event.getData()).includes('timestamp')).toBeTruthy();
		expect(event.heartbeat).toBeFalsy();
	});
});
