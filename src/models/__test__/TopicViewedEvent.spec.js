import TopicViewedEvent from '../TopicViewedEvent';
import {TOPIC_VIEWED} from '../../MimeTypes';

describe('Event: TopicViewedEvent', () => {

	beforeEach(() => jasmine.clock().install());

	afterEach(() => jasmine.clock().uninstall());

	it ('Basic Shape: Adds topic_id and sets correct MimeType', () => {
		jasmine.clock().mockDate();
		const now = Date.now();
		const course = 'dude';
		const topicId = 'abc';
		const event = new TopicViewedEvent(topicId, course, now);

		expect(event.getData()).toEqual({
			startTime: now,
			MimeType: TOPIC_VIEWED,
			RootContextID: course,
			'topic_id': topicId
		});

		expect(JSON.stringify(event)).toBe(`{"startTime":${now},"MimeType":"${TOPIC_VIEWED}","RootContextID":"${course}","topic_id":"${topicId}"}`);

		event.finish();
		expect(Object.keys(event.getData()).includes('time_length')).toBeTruthy();
		expect(Object.keys(event.getData()).includes('timestamp')).toBeTruthy();
		expect(event.heartbeat).toBeFalsy();
	});
});
