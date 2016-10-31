import Base from '../Base';
import {RESOURCE_VIEWED/*, UNKNOWN_TYPE*/} from '../../../MimeTypes';


describe('Event: Base', () => {

	beforeEach(() => jasmine.clock().install());

	afterEach(() => jasmine.clock().uninstall());

	it ('Basic Shape', () => {
		const now = Date.now();
		const event = new Base(RESOURCE_VIEWED, 'abc', now);

		expect(event.getData()).toEqual({
			startTime: now,
			MimeType: RESOURCE_VIEWED,
			RootContextID: 'abc'
		});

		expect(JSON.stringify(event)).toBe(`{"startTime":${now},"MimeType":"${RESOURCE_VIEWED}","RootContextID":"abc"}`);

		event.finish();
		expect(Object.keys(event.getData()).includes('time_length')).toBeTruthy();
		expect(Object.keys(event.getData()).includes('timestamp')).toBeTruthy();
		expect(event.heartbeat).toBeFalsy();
	});


	it ('halt() finishes and adds halted', () => {
		const event = new Base(RESOURCE_VIEWED, 'abc', Date.now());
		event.halt();

		expect(event.halted).toBe(true);
		expect(event.finished).toBe(true);
		expect(Object.keys(event.getData()).includes('halted')).toBeFalsy();
		expect(Object.keys(event.getData()).includes('finished')).toBeFalsy();
	});


	it ('setContextPath add/replaces "context_path"', () => {
		const event = new Base(RESOURCE_VIEWED, 'abc', Date.now());
		Base.freeHeartbeat(event);//don't leave the heartbeat running, but do not "finish" the event.
		expect(event.context_path).toBeFalsy();
		event.setContextPath(['a', 'b', 'c']);
		expect(event.context_path).toEqual(['a', 'b', 'c']);
		event.setContextPath(['x', 'y', 'z']);
		expect(event.context_path).toEqual(['x', 'y', 'z']);
	});


	it ('getDuration returns "time_length" OR "current time - start time" if still active', () => {
		jasmine.clock().mockDate();
		const now = Date.now();
		const event = new Base(RESOURCE_VIEWED, 'abc', now);

		expect(event.getDuration()).toBe(0);

		jasmine.clock().tick(1000);
		expect(event.getDuration()).toBe(1);

		event.finish(); //lock the duration by defining "time_length"

		jasmine.clock().tick(1000);
		expect(event.getDuration()).not.toBe(2);
		expect(event.getDuration()).toBe(1);

		expect(Object.keys(event.getData()).includes('time_length')).toBeTruthy();
		expect(event.getData().time_length).toBe(1);
	});
});
