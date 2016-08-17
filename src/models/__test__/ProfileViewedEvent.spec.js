import ProfileViewedEvent from '../ProfileViewedEvent';
import {PROFILE_VIEWED} from '../../MimeTypes';

describe('Event: ProfileViewEvent', () => {

	beforeEach(() => jasmine.clock().install());

	afterEach(() => jasmine.clock().uninstall());

	it ('Basic Shape: Sets correct MimeType and entity', () => {
		jasmine.clock().mockDate();
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
