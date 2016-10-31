import ExternalResourceEvent from '../ExternalResourceEvent';
import {RESOURCE_VIEWED} from '../../MimeTypes';

describe('Event: ExternalResourceEvent', () => {

	beforeEach(() => jasmine.clock().install());

	afterEach(() => jasmine.clock().uninstall());

	it ('Basic Shape: Auto-Finishes event and sets context', () => {
		jasmine.clock().mockDate();
		const now = Date.now();
		const course = 'dude';
		const resourceId = 'abc';
		const context = ['a', 'b', 'c'];
		const event = new ExternalResourceEvent(resourceId, course, context);

		expect(event.finished).toBeTruthy();

		expect(event.getData()).toEqual({
			startTime: now,
			MimeType: RESOURCE_VIEWED,
			RootContextID: course,
			'resource_id': resourceId,
			'context_path': context,
			timestamp: (now / 1000)
		});

		expect(JSON.stringify(event)).toBe(`{"startTime":${now},"MimeType":"${RESOURCE_VIEWED}","RootContextID":"${course}","resource_id":"${resourceId}","context_path":${JSON.stringify(context)},"timestamp":${now / 1000}}`);
	});
});
