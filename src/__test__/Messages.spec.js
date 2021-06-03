/* eslint-env jest */
import { updateValue } from '@nti/lib-commons';
import Logger from '@nti/util-logger';

import Messages from '../Messages';
import Hooks from '../Hooks';

import { mockService, BATCH_EVENT } from './util';

const logger = Logger.get('analytics:Messages');
const stub = (a, b, c) => jest.spyOn(a, b).mockImplementation(c || (() => {}));

function mockStorage(items = {}) {
	const storage = {
		setItem: () => {},
		getItem: name => items[name],
		removeItem: name => delete items[name],
	};

	jest.spyOn(storage, 'setItem');
	jest.spyOn(storage, 'getItem');

	return storage;
}

describe('Analytic Messages Test', () => {
	beforeEach(() => {
		stub(logger, 'debug');
		stub(logger, 'error');
		stub(logger, 'info');
		stub(logger, 'warn');
	});

	describe('send', () => {
		beforeEach(() => jest.useFakeTimers());
		afterEach(() => jest.useRealTimers());

		test('sending one starts the timer, and pushes message', () => {
			jest.spyOn(global, 'setTimeout');
			const messages = new Messages();

			messages.send({ id: 1 });

			expect(setTimeout.mock.calls.length).toEqual(1);

			const { stack } = messages;

			expect(stack.length).toEqual(1);
			expect(stack[0].id).toEqual(1);
		});

		test('sending two does not restart the timer, and pushes both', () => {
			jest.spyOn(global, 'setTimeout');
			const messages = new Messages();

			messages.send({ id: 1 });
			messages.send({ id: 2 });

			expect(setTimeout.mock.calls.length).toEqual(1);

			const { stack } = messages;

			expect(stack.length).toEqual(2);
			expect(stack[0].id).toEqual(1);
			expect(stack[1].id).toEqual(2);
		});

		test('when the timeout finishes, the pending timer is removed and calls flushMessages', () => {
			const messages = new Messages();

			jest.spyOn(messages, 'flushMessages');

			messages.send({ id: 1 });

			jest.runAllTimers();

			expect(messages.flushTimeout).toBeFalsy();
			expect(messages.flushMessages).toHaveBeenCalled();
		});
	});

	describe('getDataForStack', () => {
		function doTest(stack, pending) {
			const messages = new Messages('key');

			updateValue(messages, 'stack', stack);
			jest.spyOn(messages, 'getPending').mockImplementation(
				() => pending
			);

			const data = messages.getDataForBatch();

			expect(data.length).toEqual(stack.length + pending.length);

			for (let expected of [...stack, ...pending]) {
				expect(data).toContainEqual(expected);
			}
		}

		test('gets stack only if there is no pending', () => {
			doTest([{ id: 1 }], []);
		});

		test('gets pending only if there is no stack', () => {
			doTest([], [{ id: 1 }]);
		});

		test('gets stack and pending if there are both', () => {
			doTest([{ id: 1 }], [{ id: 2 }]);
		});
	});

	test('resume flushes the messages', () => {
		const messages = new Messages('key');

		jest.spyOn(messages, 'flushMessages');

		messages.resume();

		expect(messages.flushMessages).toHaveBeenCalled();
	});

	test('setService flushes the messages', () => {
		const messages = new Messages('key');
		const service = mockService();

		jest.spyOn(messages, 'flushMessages');

		messages.setService(service);

		expect(messages.flushMessages).toHaveBeenCalled();
	});

	test('clear', () => {
		const messages = new Messages('key');

		updateValue(messages, 'stack', [{ id: 1 }]);
		jest.spyOn(messages, 'setPending').mockImplementation(() => {});

		messages.clear();

		expect(messages.stack.length).toEqual(0);
		expect(messages.setPending).toHaveBeenCalledWith([]);
	});

	describe('flushMessage', () => {
		test('Clears stack and pending', () => {
			const messages = new Messages('key');

			jest.spyOn(messages, 'clear');

			messages.stack.push({ id: 1 });

			messages.flushMessages();

			expect(messages.clear).toHaveBeenCalled();
		});

		test('No Service sets data as pending', () => {
			const messages = new Messages('key');

			messages.stack.push({ id: 'stack' });

			jest.spyOn(messages, 'clear').mockImplementation(() => {});
			jest.spyOn(messages, 'setPending');
			jest.spyOn(messages, 'getPending').mockImplementation(() => [
				{ id: 'pending' },
			]);

			messages.flushMessages();

			expect(messages.setPending.mock.calls.length).toEqual(1);

			const call = messages.setPending.mock.calls[0];
			const pending = call[0];

			expect(pending.length).toEqual(2);

			const seen = {};

			for (let p of pending) {
				seen[p.id] = true;
			}

			expect(seen.stack).toBeTruthy();
			expect(seen.pending).toBeTruthy();
		});

		test('Has service but is suspended sets data as pending', () => {
			const messages = new Messages('key');

			updateValue(messages, 'service', mockService());
			messages.suspend();

			messages.stack.push({ id: 'stack' });

			jest.spyOn(messages, 'clear').mockImplementation(() => {});
			jest.spyOn(messages, 'setPending');
			jest.spyOn(messages, 'getPending').mockImplementation(() => [
				{ id: 'pending' },
			]);

			messages.flushMessages();

			expect(messages.setPending.mock.calls.length).toEqual(1);

			const call = messages.setPending.mock.calls[0];
			const pending = call[0];

			expect(pending.length).toEqual(2);

			const seen = {};

			for (let p of pending) {
				seen[p.id] = true;
			}

			expect(seen.stack).toBeTruthy();
			expect(seen.pending).toBeTruthy();
		});

		test('Posts the correct data to the service', async () => {
			const messages = new Messages('key');
			const service = mockService();

			messages.setService(service);

			updateValue(messages, 'stack', [
				{ id: 'stack1' },
				{ id: 'stack2' },
			]);
			jest.spyOn(messages, 'getPending').mockImplementation(() => [
				{ id: 'pending1' },
				{ id: 'pending2' },
			]);

			await messages.flushMessages();

			const { calls } = service.post.mock;

			expect(calls.length).toEqual(1);

			const call = calls[0];
			const data = call[1];

			expect(call[0]).toEqual(BATCH_EVENT);

			expect(data.MimeType).toEqual(
				'application/vnd.nextthought.analytics.batchevents'
			);
			expect(data.events.length).toEqual(4);

			const seen = {};

			for (let e of data.events) {
				seen[e.id] = true;
			}

			expect(seen['stack1']).toBeTruthy();
			expect(seen['stack2']).toBeTruthy();
			expect(seen['pending1']).toBeTruthy();
			expect(seen['pending2']).toBeTruthy();
		});

		test('Triggers after batch events with the events that were sent', async () => {
			const messages = new Messages('key');
			const service = mockService();
			const items = [{ id: 'stack1' }, { id: 'stack2' }];

			jest.spyOn(Hooks, 'triggerAfterBatchEvents');

			messages.setService(service);
			updateValue(messages, 'stack', items);

			await messages.flushMessages();

			const { calls } = Hooks.triggerAfterBatchEvents.mock;

			expect(calls.length).toEqual(1);

			expect(calls[0][0]).toEqual(items);
		});

		test('If the post fails with no connection the data is added to the pending', async () => {
			const messages = new Messages('key');
			const service = mockService(false, false, true);

			messages.setService(service);

			updateValue(messages, 'stack', [
				{ id: 'stack1' },
				{ id: 'stack2' },
			]);
			jest.spyOn(messages, 'getPending').mockImplementation(() => [
				{ id: 'pending1' },
				{ id: 'pending2' },
			]);
			jest.spyOn(messages, 'setPending');
			//Mock clear so it doesn't call setPending
			jest.spyOn(messages, 'clear').mockImplementation(() => {});

			await messages.flushMessages();

			//Test that it actually tries to call the service
			expect(service.post.mock.calls.length).toEqual(1);

			const { calls } = messages.setPending.mock;

			expect(calls.length).toEqual(1);

			const call = calls[0];
			const seen = {};

			expect(call[0].length).toEqual(4);

			for (let e of call[0]) {
				seen[e.id] = true;
			}

			expect(seen['stack1']).toBeTruthy();
			expect(seen['stack2']).toBeTruthy();
			expect(seen['pending1']).toBeTruthy();
			expect(seen['pending2']).toBeTruthy();
		});

		test('If post fails but has connection the data is not added to the pending', async () => {
			const messages = new Messages('key');
			const service = mockService(false, false, false, true);

			messages.setService(service);

			updateValue(messages, 'stack', [{ id: 'stack1' }]);
			jest.spyOn(messages, 'getPending').mockImplementation(() => [
				{ id: 'pending1' },
			]);
			jest.spyOn(messages, 'setPending');
			//Mock clear so it doesn't call set pending
			jest.spyOn(messages, 'clear').mockImplementation(() => {});

			await messages.flushMessages();

			expect(messages.setPending).not.toHaveBeenCalled();
		});
	});

	describe('setPending', () => {
		test('When give a storage it calls setItem on it', () => {
			const storage = mockStorage();
			const messages = new Messages('key', storage);
			const pending = [{ id: 'pending1' }, { id: 'pending2' }];

			messages.setPending(pending);

			const { calls } = storage.setItem.mock;

			expect(calls.length).toEqual(1);

			const call = calls[0];

			expect(call[0]).toEqual('key-pending-analytic-events');
			expect(typeof call[1]).toEqual('string');

			const json = JSON.parse(call[1]);
			expect(json.length).toEqual(2);

			const seen = {};

			for (let p of json) {
				seen[p.id] = true;
			}

			expect(seen['pending1']).toBeTruthy();
			expect(seen['pending2']).toBeTruthy();
		});

		test('Without storage sets the items to the pending property', () => {
			const messages = new Messages('key');
			const pending = [{ id: 'pending1' }, { id: 'pending2' }];

			messages.setPending(pending);

			expect(messages.pending).toEqual(pending);
		});
	});

	describe('getPending', () => {
		test('When given storage calls getItem and JSON.parses it', () => {
			const data = [{ id: 'pending1' }, { id: 'pending2' }];
			const storage = mockStorage({
				'key-pending-analytic-events': JSON.stringify(data),
			});
			const messages = new Messages('key', storage);

			const pending = messages.getPending();

			expect(storage.getItem).toHaveBeenCalledWith(
				'key-pending-analytic-events'
			);
			expect(pending.length).toEqual(2);

			const seen = {};

			for (let p of pending) {
				seen[p.id] = true;
			}

			expect(seen['pending1']).toBeTruthy();
			expect(seen['pending2']).toBeTruthy();
		});
	});
});
