/* eslint-env jest */
import Logger from 'nti-util-logger';

import Base from '../Base';

const logger = Logger.get('analytics:event');
const stub = (a, b, c) => jest.spyOn(a, b).mockImplementation(c || (() => {}));

class TestImmediateEvent extends Base {
	static EventType = 'test-immediate-event'
}

class TestNonImmediateEvent extends Base {
	static EventType = 'test-non-immediate-event';
	static Immediate = false
}

describe('Base Analytic Event', () => {
	beforeEach(() => {
		stub(logger, 'debug');
		stub(logger, 'error');
		stub(logger, 'info');
		stub(logger, 'warn');
	});

	test('findActiveEvent predicate returns true only for the event with the same type and resourceId', () => {
		const resourceId = 'testResource';

		let predicate;

		const manager = {
			findActiveEvent: (fn) => predicate = fn
		};

		TestImmediateEvent.findActiveEvent(manager, resourceId);

		expect(predicate({type: 'not', resourceId: 'not'})).toBeFalsy();
		expect(predicate({type: 'test-immediate-event', resourceId: 'not'})).toBeFalsy();
		expect(predicate({type: 'not', resourceId})).toBeFalsy();
		expect(predicate({type: 'test-immediate-event', resourceId})).toBeTruthy();
	});


	describe('makeFactory', () => {
		test('factory has the send method', () => {
			const factory = Base.makeFactory({});

			expect(typeof factory.send).toEqual('function');
		});

		test('Immediate event pushes, with correct resourceId, type, and data', () => {
			const manager = {
				pushEvent: jest.fn()
			};

			const resourceId = 'testResourceId';
			const factory = TestImmediateEvent.makeFactory(manager);

			factory.send();
			expect(manager.pushEvent).not.toHaveBeenCalled();
			expect(logger.error).toHaveBeenCalledWith('Could not send event because: %o', expect.anything());

			manager.pushEvent.mockClear();

			factory.send(resourceId, {id: 'test', rootContextId: '1:2:3', user: 'foobar'});

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
				pushEvent: jest.fn()
			};

			const factory = TestNonImmediateEvent.makeFactory(manager);
			const resourceId = 'testResourceId';

			factory.send(resourceId, {id: 'test', rootContextId: '1:2:3', user: 'foobar'});

			const {calls} = manager.pushEvent.mock;

			expect(calls.length).toEqual(1);

			const call = calls[0];

			expect(call[0]).toBeInstanceOf(TestNonImmediateEvent);
			expect(call[0].resourceId).toEqual(resourceId);
			expect(call[0].type).toEqual('test-non-immediate-event');
			expect(call[0].data.id).toEqual('test');
			expect(call[1]).toBeFalsy();
		});
	});

	describe('data', () => {
		const type = 'test-type';
		const resourceId = 'test-resource-id';
		const data = {id: 1, context: ['context'], user: 'user', rootContextId: 'root'};
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

			testEvent = new Base(type, resourceId, data, manager);
		});

		afterEach(() => {
			global.Date = oldDate;
		});

		test('sets the type', () => {
			expect(testEvent.type).toEqual(type);
		});

		test('sets the resourceId', () => {
			expect(testEvent.resourceId).toEqual(resourceId);
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

		test('sets rootContextId from data', () => {
			expect(testEvent.rootContextId).toEqual(data.rootContextId);
		});

		test('gets context from manager if not in data', () => {
			const localEvent = new Base(type, resourceId, {rootContextId: '1:2:3', user: 'foobar'}, manager);

			expect(localEvent.context).toEqual(manager.context);
		});

		test('context is empty array if none given', () => {
			const localEvent = new Base(type, resourceId, {rootContextId: '1:2:3', user: 'foobar'}, {});

			expect(localEvent.context).toEqual([]);
		});

		test('sets rootContextId from context if not given one', () => {
			const context = ['root'];
			const localEvent = new Base(type, resourceId, {context, user: 'foobar'}, {});

			expect(localEvent.rootContextId).toEqual('root');
		});

		test('Throws if rootContextId is not given', () => {
			expect(() => new Base(type, resourceId, {}, {})).toThrow();
		});

		test('sets user from the manager if not in data', () => {
			const localEvent = new Base(type, resourceId, {}, manager);

			expect(localEvent.user).toEqual(manager.user);
		});

		test('getData returns expected values', () => {
			const output = testEvent.getData();

			expect(output.MimeType).toEqual(type);
			expect(output['context_path']).toEqual(data.context);
			expect(output.RootContextID).toEqual(data.rootContextId);
			expect(output.timestamp).toEqual(DATE_TO_USE.getTime() / 1000);
			expect(output.user).toEqual(data.user);
			expect(output.ResourceId).toEqual(resourceId);
		});
	});

	test('isFinished returns false if onDataSent has not been called', () => {
		const testEvent = new Base('dummy', 'id', {rootContextId: '1:2:3', user: 'foobar'});

		expect(testEvent.isFinished()).toBeFalsy();
	});

	test('isFinished returns true if onDataSent has been called', () => {
		const testEvent = new Base('dummy', 'id', {rootContextId: '1:2:3', user: 'foobar'});

		testEvent.onDataSent();
		expect(testEvent.isFinished()).toBeTruthy();
	});
});
