/* globals spyOn */
/* eslint-env jest */
import {Date as DateUtils} from 'nti-commons';

import ProfileActivityViewedEvent from '../ProfileActivityViewedEvent';
import {PROFILE_ACTIVITY_VIEWED} from '../../MimeTypes';

describe('Event: ProfileActivityViewedEvent', () => {

	beforeEach(() => jest.useFakeTimers());

	afterEach(() => {
		DateUtils.MockDate.uninstall();
		jest.useRealTimers();
	});

	test ('Basic Shape: Sets correct MimeType and entity', () => {
		DateUtils.MockDate.install();
		const now = Date.now();
		const user = 'user123';

		const event = new ProfileActivityViewedEvent(user);
		ProfileActivityViewedEvent.freeHeartbeat(event);

		expect(event.getData()).toEqual({
			startTime: now,
			MimeType: PROFILE_ACTIVITY_VIEWED,
			ProfileEntity: user
		});

		expect(JSON.stringify(event)).toBe(`{"startTime":${now},"MimeType":"${PROFILE_ACTIVITY_VIEWED}","ProfileEntity":"${user}"}`);
	});
});
