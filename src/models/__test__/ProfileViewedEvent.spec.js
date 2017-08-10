/* eslint-env jest */
import {Date as DateUtils} from 'nti-commons';

import ProfileViewedEvent from '../ProfileViewedEvent';
import {PROFILE_VIEWED} from '../../MimeTypes';

describe('Event: ProfileViewEvent', () => {

	beforeEach(() => jest.useFakeTimers());

	afterEach(() => {
		DateUtils.MockDate.uninstall();
		jest.useRealTimers();
	});

	test ('Basic Shape: Sets correct MimeType and entity', () => {
		DateUtils.MockDate.install();
		const now = Date.now();
		const user = 'user123';
		const event = new ProfileViewedEvent(user);
		ProfileViewedEvent.freeHeartbeat(event);

		expect(event.getData()).toEqual({
			startTime: now,
			MimeType: PROFILE_VIEWED,
			ProfileEntity: user
		});

		expect(JSON.stringify(event)).toBe(`{"startTime":${now},"MimeType":"${PROFILE_VIEWED}","ProfileEntity":"${user}"}`);
	});
});
