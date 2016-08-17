import ProfileMembershipViewedEvent from '../ProfileMembershipViewedEvent';
import {PROFILE_MEMBERSHIP_VIEWED} from '../../MimeTypes';

describe('Event: ProfileMembershipViewedEvent', () => {

	beforeEach(() => jasmine.clock().install());

	afterEach(() => jasmine.clock().uninstall());

	it ('Basic Shape: Sets correct MimeType and entity', () => {
		jasmine.clock().mockDate();
		const now = Date.now();
		const user = 'user123';

		const event = new ProfileMembershipViewedEvent(user);
		ProfileMembershipViewedEvent.freeHeartbeat(event);

		expect(event.getData()).toEqual({
			startTime: now,
			MimeType: PROFILE_MEMBERSHIP_VIEWED,
			ProfileEntity: user
		});

		expect(JSON.stringify(event)).toBe(`{"startTime":${now},"MimeType":"${PROFILE_MEMBERSHIP_VIEWED}","ProfileEntity":"${user}"}`);
	});
});
