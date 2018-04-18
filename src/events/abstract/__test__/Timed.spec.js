/* eslint-env jest */
import Logger from '@nti/util-logger';

import Timed from '../Timed';

const logger = Logger.get('analytics:event');
const stub = (a, b, c) => jest.spyOn(a, b).mockImplementation(c || (() => {}));

class TestImmediateEvent extends Timed {
	static EventType = 'test-immediate-event'
}

class TestNonImmediateEvent extends Timed {
	static EventType = 'test-non-immediate-event'
	static Immediate = false
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
				findActiveEvent: () => ((manager.pushEvent.mock.calls || [])[0] || [])[0]
			};

			const factory = TestImmediateEvent.makeFactory(manager);
			stub(logger, 'error');
			factory.start();
			expect(manager.pushEvent).not.toHaveBeenCalled();

			const resourceId = 'testResourceId1';

			factory.start(resourceId, {id: 'test', rootContextId: '1:2:3', user: 'foobar'});

			const {calls} = manager.pushEvent.mock;

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
				findActiveEvent: () => ((manager.pushEvent.mock.calls || [])[0] || [])[0]
			};

			const factory = TestNonImmediateEvent.makeFactory(manager);
			const resourceId = 'testResourceId2';

			factory.start(resourceId, {id: 'test', rootContextId: '1:2:3', user: 'foobar'});

			const {calls} = manager.pushEvent.mock;

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
				findActiveEvent: () => null
			};

			const factory = TestImmediateEvent.makeFactory(manager);

			stub(logger, 'error');

			factory.stop('test-resource-id');

			expect(logger.error).toHaveBeenCalledWith('Could not stop event, because: %s', expect.anything());
		});

		test('Stop calls stop on the event it finds', () => {
			const event = {stop: jest.fn()};
			const data = {};
			const manager = {
				findActiveEvent: () => event
			};

			const factory = TestImmediateEvent.makeFactory(manager);

			factory.stop('test-resource-id', data);

			expect(event.stop).toHaveBeenCalledWith(data);
		});

		test('update throws if it does not find an active event', () => {
			const manager = {
				findActiveEvent: () => null
			};

			const factory = TestImmediateEvent.makeFactory(manager);

			stub(logger, 'error');

			factory.update('test-resource-id', {});
			expect(logger.error).toHaveBeenCalledWith('Could not update event, because: %s', expect.anything());
		});

		test('update calls updateData on the event it finds', () => {
			const event = {updateData: jest.fn()};
			const data = {};
			const manager = {
				findActiveEvent: () => event
			};

			const factory = TestImmediateEvent.makeFactory(manager);

			factory.update('test-resource-id', data);

			expect(event.updateData).toHaveBeenCalledWith(data);
		});
	});

	//TODO: figure out a good way to test the times since they depend on dates...
});
