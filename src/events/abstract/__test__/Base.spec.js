/* eslint-env jest */
import Base from '../Base';

class TestImmediateEvent extends Base {
	static EventType = 'test-immediate-event'
}

class TestNonImmediateEvent extends Base {
	static EventType = 'test-non-immediate-event';
	static Immediate = false
}

describe('Base Analytic Event', () => {
	test('findActiveEvent predicate returns true only for the event with the same type and resourceID', () => {
		const resourceID = 'testResource';

		let predicate;

		const manager = {
			findActiveEvent: (fn) => predicate = fn
		};

		TestImmediateEvent.findActiveEvent(manager, resourceID);

		expect(predicate({type: 'not', resourceID: 'not'})).toBeFalsy();
		expect(predicate({type: 'test-immediate-event', resourceID: 'not'})).toBeFalsy();
		expect(predicate({type: 'not', resourceID})).toBeFalsy();
		expect(predicate({type: 'test-immediate-event', resourceID})).toBeTruthy();
	});


	describe('makeFactory', () => {
		test('factory has the send method', () => {
			const factory = Base.makeFactory({});

			expect(typeof factory.send).toEqual('function');
		});

		test('Immediate event pushes, with correct resourceID, type, and data', () => {
			const manager = {
				pushEvent: jest.fn()
			};

			const factory = TestImmediateEvent.makeFactory(manager);
			const resourceID = 'testResourceID';

			factory.send(resourceID, {id: 'test'});

			const {calls} = manager.pushEvent.mock;

			expect(calls.length).toEqual(1);

			const call = calls[0];

			expect(call[0]).toBeInstanceOf(TestImmediateEvent);
			expect(call[0].resourceID).toEqual(resourceID);
			expect(call[0].type).toEqual('test-immediate-event');
			expect(call[0].data.id).toEqual('test');
			expect(call[1]).toBeTruthy();
		});

		test('Non-immediate event pushes, with correct resourceID, type, and data', () => {
			const manager = {
				pushEvent: jest.fn()
			};

			const factory = TestNonImmediateEvent.makeFactory(manager);
			const resourceID = 'testResourceID';

			factory.send(resourceID, {id: 'test'});

			const {calls} = manager.pushEvent.mock;

			expect(calls.length).toEqual(1);

			const call = calls[0];

			expect(call[0]).toBeInstanceOf(TestNonImmediateEvent);
			expect(call[0].resourceID).toEqual(resourceID);
			expect(call[0].type).toEqual('test-non-immediate-event');
			expect(call[0].data.id).toEqual('test');
			expect(call[1]).toBeFalsy();
		});
	});

	describe('data', () => {
		const type = 'test-type';
		const resourceID = 'test-resource-id';
		const data = {id: 1, context: ['context'], user: 'user', RootContextID: 'root'};
		const manager = {context: ['manager-context'], user: 'manager-user'};
		const DATE_TO_USE = new Date('2016');

		let oldDate;
		let testEvent;

		beforeEach(() => {
			oldDate = global.Date;

			const _Date = Date;
			global.Date = jest.fn(() => DATE_TO_USE);
			global.Date.UTC = _Date.UTC;
			global.Date.parse = _Date.parse;
			global.Date.now = _Date.now;

			testEvent = new Base(type, resourceID, data, manager);
		});

		afterEach(() => {
			global.Date = oldDate;
		});

		test('sets the type', () => {
			expect(testEvent.type).toEqual(type);
		});

		test('sets the resourceID', () => {
			expect(testEvent.resourceID).toEqual(resourceID);
		});

		test('sets the manager', () => {
			expect(testEvent.manager).toEqual(manager);
		});

		test('sets the startTime', () => {
			expect(testEvent.startTime).toEqual(DATE_TO_USE);
		});

		test('sets the data', () => {
			expect(testEvent.data.id).toEqual(1);
		});

		test('sets context from data', () => {
			expect(testEvent.context).toEqual(data.context);
		});

		test('sets user from data', () => {
			expect(testEvent.user).toEqual(data.user);
		});

		test('sets RootContextID from data', () => {
			expect(testEvent.RootContextID).toEqual(data.RootContextID);
		});

		test('gets context from manager if not in data', () => {
			const localEvent = new Base(type, resourceID, {}, manager);

			expect(localEvent.context).toEqual(manager.context);
		});

		test('context is empty array if none given', () => {
			const localEvent = new Base(type, resourceID, {}, {});

			expect(localEvent.context).toEqual([]);
		});

		test('sets RootContextId from context if not given one', () => {
			const context = ['root'];
			const localEvent = new Base(type, resourceID, {context}, {});

			expect(localEvent.RootContextID).toEqual('root');
		});

		test('sets RootContextId to empty string if none given', () => {
			const localEvent = new Base(type, resourceID, {}, {});

			expect(localEvent.RootContextID).toEqual('');
		});

		test('sets user from the manager if not in data', () => {
			const localEvent = new Base(type, resourceID, {}, manager);

			expect(localEvent.user).toEqual(manager.user);
		});

		test('getData returns expected values', () => {
			const output = testEvent.getData();

			expect(output.MimeType).toEqual(type);
			expect(output['context_path']).toEqual(data.context);
			expect(output.RootContextId).toEqual(data.RootContextID);
			expect(output.timestamp).toEqual(DATE_TO_USE.getTime() / 1000);
			expect(output.user).toEqual(data.user);
			expect(output.ResourceId).toEqual(resourceID);
		});
	});

	test('isFinished returns false if onDataSent has not been called', () => {
		const testEvent = new Base();

		expect(testEvent.isFinished()).toBeFalsy();
	});

	test('isFinished returns true if onDataSent has been called', () => {
		const testEvent = new Base();

		testEvent.onDataSent();
		expect(testEvent.isFinished()).toBeTruthy();
	});
});
