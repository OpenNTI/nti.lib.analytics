import {Date as DateUtils} from 'nti-commons';

import ExternalResourceEvent from '../ExternalResourceEvent';
import {RESOURCE_VIEWED} from '../../MimeTypes';

describe('Event: ExternalResourceEvent', () => {

	beforeEach(() => jest.useFakeTimers());

	afterEach(() => {
		DateUtils.MockDate.uninstall();
		jest.useRealTimers();
	});

	test ('Basic Shape: Auto-Finishes event and sets context', () => {
		DateUtils.MockDate.install();
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
