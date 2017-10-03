/* eslint-env jest */
import {Date as DateUtils} from 'nti-commons';

import Base from '../Base';
import {RESOURCE_VIEWED/*, UNKNOWN_TYPE*/} from '../../../MimeTypes';


describe('Event: Base', () => {

	beforeEach(() => jest.useFakeTimers());

	afterEach(() => {
		DateUtils.MockDate.uninstall();
		jest.useRealTimers();
	});

	test ('Base.finish() adds time_length and timestamp', () => {
		let event = {};
		Base.finish(event);

		event = JSON.parse(JSON.stringify(event));

		expect(event).toHaveProperty('time_length');
		expect(event).toHaveProperty('timestamp');
		expect(event).toHaveProperty('finished', true);
	});

	test ('Basic Shape', () => {
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


	test ('halt() finishes and adds halted', () => {
		const event = new Base(RESOURCE_VIEWED, 'abc', Date.now());
		event.halt();

		expect(event.halted).toBe(true);
		expect(event.finished).toBe(true);
		expect(Object.keys(event.getData()).includes('halted')).toBeFalsy();
		expect(Object.keys(event.getData()).includes('finished')).toBeFalsy();
	});


	test ('setContextPath add/replaces "context_path"', () => {
		const event = new Base(RESOURCE_VIEWED, 'abc', Date.now());
		Base.freeHeartbeat(event);//don't leave the heartbeat running, but do not "finish" the event.
		expect(event.context_path).toBeFalsy();
		event.setContextPath(['a', 'b', 'c']);
		expect(event.context_path).toEqual(['a', 'b', 'c']);
		event.setContextPath(['x', 'y', 'z']);
		expect(event.context_path).toEqual(['x', 'y', 'z']);
	});


	test ('getDuration returns "time_length" OR "current time - start time" if still active', () => {
		DateUtils.MockDate.install();
		const now = Date.now();
		const event = new Base(RESOURCE_VIEWED, 'abc', now);

		expect(event.getDuration()).toBe(0);

		DateUtils.MockDate.install(now + 1000);
		jest.runTimersToTime(1000);
		expect(event.getDuration()).toBe(1);

		event.finish(); //lock the duration by defining "time_length"

		DateUtils.MockDate.install(now + 2000);
		jest.runTimersToTime(1000);
		expect(event.getDuration()).not.toBe(2);
		expect(event.getDuration()).toBe(1);

		expect(Object.keys(event.getData()).includes('time_length')).toBeTruthy();
		expect(event.getData().time_length).toBe(1);
	});
});
