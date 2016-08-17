import ProfileEvent from '../ProfileEvent';
import {PROFILE_VIEWED} from '../../../MimeTypes';

describe('Event: ProfileEvent', () => {

	beforeEach(() => jasmine.clock().install());

	afterEach(() => jasmine.clock().uninstall());

	it ('Adds ProfileEntity property', () => {
		const now = Date.now();
		const user = 'user123';
		const event = new ProfileEvent(PROFILE_VIEWED, user, now);
		ProfileEvent.freeHeartbeat(event);

		expect(event.getData()).toEqual({
			startTime: now,
			MimeType: PROFILE_VIEWED,
			ProfileEntity: user
		});

		expect(JSON.stringify(event)).toBe(`{"startTime":${now},"MimeType":"${PROFILE_VIEWED}","ProfileEntity":"${user}"}`);
	});
});