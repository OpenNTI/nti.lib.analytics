import ProfileActivityViewedEvent from '../ProfileActivityViewedEvent';
import {PROFILE_ACTIVITY_VIEWED} from '../../MimeTypes';

describe('Event: ProfileActivityViewedEvent', () => {

	beforeEach(() => jasmine.clock().install());

	afterEach(() => jasmine.clock().uninstall());

	it ('Basic Shape: Sets correct MimeType and entity', () => {
		jasmine.clock().mockDate();
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
