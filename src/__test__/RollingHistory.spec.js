/* eslint-env jest */

import {addHistory, getHistory} from '../index';

describe('Rolling History', () => {

	test('initial history is empty', () => {
		expect(getHistory()).toEqual([]);
	});


	test('addHistory() adds items to the front, capping list length to 10', () => {

		for (let i = 1; i < 15; i++) {
			addHistory('test' + i);
		}

		expect(getHistory()).toEqual([
			'test14', 'test13', 'test12', 'test11', 'test10', 'test9', 'test8', 'test7', 'test6', 'test5', 'test4'
		]);
	});
});
