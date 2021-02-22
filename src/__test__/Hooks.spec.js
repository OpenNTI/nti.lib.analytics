/* eslint-env jest */
import Hooks from '../Hooks';

describe('Analytic Hooks Test', () => {
	test('listeners get called with correct data', () => {
		const listener = jest.fn();
		const data = [{ id: 1 }, { id: 2 }];

		Hooks.addAfterBatchEventsListener(listener);
		Hooks.triggerAfterBatchEvents(data);

		const { calls } = listener.mock;

		expect(calls.length).toEqual(1);
		expect(calls[0][0]).toEqual(data);
	});

	test('removed listeners are not called', () => {
		const listener = jest.fn();

		Hooks.addAfterBatchEventsListener(listener);
		Hooks.removeAfterBatchEventsListener(listener);
		Hooks.triggerAfterBatchEvents([]);

		expect(listener.mock.calls.length).toEqual(0);
	});
});
