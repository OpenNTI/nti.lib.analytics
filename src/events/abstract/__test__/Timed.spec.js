/* eslint-env jest */
import Logger from '@nti/util-logger';
import { Date as DateUtils } from '@nti/lib-commons';

import Timed from '../Timed';

const { MockDate } = DateUtils;

const logger = Logger.get('analytics:event');
const stub = (a, b, c) => jest.spyOn(a, b).mockImplementation(c || (() => {}));
const getSeconds = t => {
	return new MockDate.OriginalDate(t).getTime() / 1000;
};

class TestImmediateEvent extends Timed {
	static EventType = 'test-immediate-event';
}

class TestNonImmediateEvent extends Timed {
	static EventType = 'test-non-immediate-event';
	static Immediate = false;
}

describe('Timed Analytic Event Tests', () => {
	describe('makeFactory', () => {
		test('makeFactory throws if no manager', () => {
			expect(() => Timed.makeFactory()).toThrow();
		});

		test('factory defines start and stop', () => {
			const factory = Timed.makeFactory({});

			expect(typeof factory.start).toEqual('function');
			expect(typeof factory.stop).toEqual('function');
		});

		test('Immediate event pushes, with correct resourceId, type, and data', () => {
			const manager = {
				pushEvent: jest.fn(),
				findActiveEvent: () =>
					((manager.pushEvent.mock.calls || [])[0] || [])[0],
			};

			const factory = TestImmediateEvent.makeFactory(manager);
			stub(logger, 'error');
			factory.start();
			expect(manager.pushEvent).not.toHaveBeenCalled();

			const resourceId = 'testResourceId1';

			factory.start(resourceId, {
				id: 'test',
				rootContextId: '1:2:3',
				user: 'foobar',
			});

			const { calls } = manager.pushEvent.mock;

			expect(calls.length).toEqual(1);

			const call = calls[0];

			expect(call[0]).toBeInstanceOf(TestImmediateEvent);
			expect(call[0].resourceId).toEqual(resourceId);
			expect(call[0].type).toEqual('test-immediate-event');
			expect(call[0].data.id).toEqual('test');
			expect(call[1]).toBeTruthy();
		});

		test('Non-immediate event pushes, with correct resourceId, type, and data', () => {
			const manager = {
				pushEvent: jest.fn(),
				findActiveEvent: () =>
					((manager.pushEvent.mock.calls || [])[0] || [])[0],
			};

			const factory = TestNonImmediateEvent.makeFactory(manager);
			const resourceId = 'testResourceId2';

			factory.start(resourceId, {
				id: 'test',
				rootContextId: '1:2:3',
				user: 'foobar',
			});

			const { calls } = manager.pushEvent.mock;

			expect(calls.length).toEqual(1);

			const call = calls[0];

			expect(call[0]).toBeInstanceOf(TestNonImmediateEvent);
			expect(call[0].resourceId).toEqual(resourceId);
			expect(call[0].type).toEqual('test-non-immediate-event');
			expect(call[0].data.id).toEqual('test');
			expect(call[1]).toBeFalsy();
		});

		test('Stop throws if it does not find an active event', () => {
			const manager = {
				findActiveEvent: () => null,
			};

			const factory = TestImmediateEvent.makeFactory(manager);

			stub(logger, 'error');

			factory.stop('test-resource-id');

			expect(logger.error).toHaveBeenCalledWith(
				expect.stringContaining('Could not stop event'),
				expect.anything(),
				expect.anything()
			);
		});

		test('Stop calls stop on the event it finds', () => {
			const event = { stop: jest.fn() };
			const data = {};
			const manager = {
				findActiveEvent: () => event,
			};

			const factory = TestImmediateEvent.makeFactory(manager);

			factory.stop('test-resource-id', data);

			expect(event.stop).toHaveBeenCalledWith(data);
		});

		test('Resuming a finished event does not result in negative duration', async () => {
			// constructor (type, resourceId, data, manager) {
			const event = new TestImmediateEvent(
				'test-event-type',
				'test-resource-id',
				{
					// required by the event object, but not important for our purposes
					rootContextId: 'test-root-context-id',
					user: 'foo',
				}
			);

			const wait = (cb, duration = 100) =>
				new Promise(resolve =>
					setTimeout(() => {
						resolve(cb());
					}, duration)
				);
			event.stop();
			await wait(() => event.suspend());
			await wait(() => event.resume());

			const { Duration } = event.getData();
			expect(Duration).toBeGreaterThanOrEqual(0);
		});

		test('update throws if it does not find an active event', () => {
			const manager = {
				findActiveEvent: () => null,
			};

			const factory = TestImmediateEvent.makeFactory(manager);

			stub(logger, 'error');

			factory.update('test-resource-id', {});
			expect(logger.error).toHaveBeenCalledWith(
				expect.stringContaining('Could not update event'),
				expect.anything(),
				expect.anything()
			);
		});

		test('update calls updateData on the event it finds', () => {
			const event = { updateData: jest.fn() };
			const data = {};
			const manager = {
				findActiveEvent: () => event,
			};

			const factory = TestImmediateEvent.makeFactory(manager);

			factory.update('test-resource-id', data);

			expect(event.updateData).toHaveBeenCalledWith(data);
		});
	});

	describe('sleep/wake', () => {
		const makeEvent = () =>
			new Timed('test', 'resourceId', {
				id: 'test',
				rootContextId: '1:2:3',
				user: 'foobar',
			});
		const mockDates = {
			start: 'December 1, 2019 12:00:00',
			afterStart: 'December 1, 2019 12:30:00',
			sleep: 'December 1, 2019 18:00:00',
			afterSleep: 'December 1, 2019 18:30:00',
			wakeUp: 'December 10, 2019 12:00:00',
			afterWakeUp: 'December 10, 2019 12:30:00',
		};

		beforeEach(() => {
			DateUtils.MockDate.install();
		});

		afterEach(() => {
			DateUtils.MockDate.uninstall();
		});

		test("ends event on sleep, but doesn't close it", () => {
			MockDate.setDestination(mockDates.start).hit88MPH();

			const event = makeEvent();

			MockDate.setDestination(mockDates.afterStart).illBeBack();

			let data = event.getData();

			expect(data.timestamp).toEqual(getSeconds(mockDates.start));
			expect(data.Duration).toEqual(
				getSeconds(mockDates.afterStart) - getSeconds(mockDates.start)
			);

			event.sleep(new Date(mockDates.sleep));
			MockDate.setDestination(mockDates.afterSleep).hit88MPH();

			data = event.getData();

			expect(data.timestamp).toEqual(getSeconds(mockDates.start));
			expect(data.Duration).toEqual(
				getSeconds(mockDates.sleep) - getSeconds(mockDates.start)
			);
			expect(event.isFinished()).toBe(false);
		});

		test('updates timestamp, and Duration on wake', () => {
			MockDate.setDestination(mockDates.start).hit88MPH();

			const event = makeEvent();

			MockDate.setDestination(mockDates.afterStart).illBeBack();

			event.sleep(new Date(mockDates.sleep));
			MockDate.setDestination(mockDates.afterSleep).hit88MPH();

			event.wakeUp(new Date(mockDates.wakeUp));
			MockDate.setDestination(mockDates.afterWakeUp).hit88MPH();

			const data = event.getData();

			expect(data.timestamp).toEqual(getSeconds(mockDates.wakeUp));
			expect(data.Duration).toEqual(
				getSeconds(mockDates.afterWakeUp) - getSeconds(mockDates.wakeUp)
			);
		});
	});

	//TODO: figure out a good way to test the times since they depend on dates...
});
