/* eslint-env jest */
import Timed from '../Timed';

class TestImmediateEvent extends Timed {
	static EventType = 'test-immediate-event'
}

class TestNonImmediateEvent extends Timed {
	static EventType = 'test-non-immediate-event'
	static Immediate = false
}

describe('Timed Analytic Event Tests', () => {
	describe('makeFactory', () => {
		test('factory defines start and stop', () => {
			const factory = Timed.makeFactory({});

			expect(typeof factory.start).toEqual('function');
			expect(typeof factory.stop).toEqual('function');
		});

		test('Immediate event pushes, with correct resourceID, type, and data', async () => {
			const manager = {
				pushEvent: jest.fn()
			};

			const factory = TestImmediateEvent.makeFactory(manager);
			const resourceID = 'testResourceID';

			await factory.start(resourceID, {id: 'test'});

			const {calls} = manager.pushEvent.mock;

			expect(calls.length).toEqual(1);

			const call = calls[0];

			expect(call[0]).toBeInstanceOf(TestImmediateEvent);
			expect(call[0].resourceID).toEqual(resourceID);
			expect(call[0].type).toEqual('test-immediate-event');
			expect(call[0].data.id).toEqual('test');
			expect(call[1]).toBeTruthy();
		});

		test('Non-immediate event pushes, with correct resourceID, type, and data', async () => {
			const manager = {
				pushEvent: jest.fn()
			};

			const factory = TestNonImmediateEvent.makeFactory(manager);
			const resourceID = 'testResourceID';

			await factory.start(resourceID, {id: 'test'});

			const {calls} = manager.pushEvent.mock;

			expect(calls.length).toEqual(1);

			const call = calls[0];

			expect(call[0]).toBeInstanceOf(TestNonImmediateEvent);
			expect(call[0].resourceID).toEqual(resourceID);
			expect(call[0].type).toEqual('test-non-immediate-event');
			expect(call[0].data.id).toEqual('test');
			expect(call[1]).toBeFalsy();
		});

		test('Stop throws if it does not find an active event', () => {
			const manager = {
				findActiveEvent: () => null
			};

			const factory = TestImmediateEvent.makeFactory(manager);

			expect(factory.stop('test-resource-id')).rejects.toEqual(expect.anything());
		});

		test('Stop calls stop on the event it finds', async () => {
			const event = {stop: jest.fn()};
			const data = {};
			const manager = {
				findActiveEvent: () => event
			};

			const factory = TestImmediateEvent.makeFactory(manager);

			await factory.stop('test-resource-id', data);

			expect(event.stop).toHaveBeenCalledWith(data);
		});
	});

	//TODO: figure out a good way to test the times since they depend on dates...
});
