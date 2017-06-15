/* eslint-env jest */
import {
	filterContextPath,
	toAnalyticsPath
} from '../index';

describe('utils', () => {

	test ('filterContextPath', () => {
		const id = 'c';
		const context1 = filterContextPath([{ntiid: 'a'}, {ntiid: 'b'}, {ntiid: id}], id);
		expect(context1).toEqual([{ntiid: 'a'}, {ntiid: 'b'}]);

		const context2 = filterContextPath(['a', 'b', id], id);
		expect(context2).toEqual(['a', 'b']);

		const context3 = filterContextPath([{}, {ntiid: 'b'}, {ntiid: id}], id);
		expect(context3).toEqual([{ntiid: 'b'}]);

		const context4 = filterContextPath([{}, {ntiid: 'b'}, {ntiid: id}], id);
		expect(context4).toEqual([{ntiid: 'b'}]);

		const context5 = filterContextPath([{}, {ntiid: 'b'}], id);
		expect(context5).toEqual([{ntiid: 'b'}]);

		const context6 = filterContextPath([{ntiid: 'b'}], id);
		expect(context6).toEqual([{ntiid: 'b'}]);
	});


	test ('toAnalyticsPath', () => {
		const id = 'c';
		const path1 = toAnalyticsPath([{ntiid: 'a'}, {something: 'else'}, {ntiid: 'b'}, {ntiid: id}], id);
		expect(path1).toEqual(['a', 'b']);
	});

});
