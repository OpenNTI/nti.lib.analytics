import {
	filterContextPath,
	toAnalyticsPath,
	readOnly,
	updateValue,
	definePublic,
	defineProtected
} from '../index';

describe('utils', () => {

	it ('filterContextPath', () => {
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


	it ('toAnalyticsPath', () => {
		const id = 'c';
		const path1 = toAnalyticsPath([{ntiid: 'a'}, {something: 'else'}, {ntiid: 'b'}, {ntiid: id}], id);
		expect(path1).toEqual(['a', 'b']);
	});


	it ('Object property spec macro: readOnly', () => {
		expect(readOnly('abc')).toEqual({configurable: true, enumerable: false, writable: false, value: 'abc'});
		expect(readOnly('abc', true)).toEqual({configurable: true, enumerable: true, writable: false, value: 'abc'});

		function test (visible) {
			const o = {};
			expect(o.test).toBeUndefined();
			Object.defineProperty(o, 'test', readOnly('abc', visible));
			expect(o.test).not.toBeUndefined();
			expect(o.test).toBe('abc');
			expect(() => o.test = 'xyz').toThrow();
			expect(o.test).toBe('abc');
			expect(Object.keys(o).includes('test')).toBe(visible);
			expect(JSON.stringify(o)).toBe(visible ? '{"test":"abc"}' : '{}');
		}

		test(false);
		test(true);
	});

	it ('Object property spec macro: defineProtected (non-enumerable/skipped by JSON.stringify)', () => {
		expect(defineProtected({test: 'abc', foo: 'bar'}))
			.toEqual({
				test: {configurable: true, enumerable: false, writable: false, value: 'abc'},
				foo: {configurable: true, enumerable: false, writable: false, value: 'bar'}
			});
	});

	it ('Object property spec macro: definePublic', () => {
		expect(definePublic({test: 'abc', foo: 'bar'}))
			.toEqual({
				test: {configurable: true, enumerable: true, writable: false, value: 'abc'},
				foo: {configurable: true, enumerable: true, writable: false, value: 'bar'}
			});
	});


	it ('Object property spec macro: updateValue', () => {
		const o = {test: 'abc'};
		const spec = {...Object.getOwnPropertyDescriptor(o, 'test')};
		expect(o.test).toBe('abc');

		updateValue(o, 'test', 'xyz');

		expect(o.test).toBe('xyz');
		expect(Object.getOwnPropertyDescriptor(o, 'test')).toEqual({...spec, value: 'xyz'});

		//Updating a non-existant property creates it 'readOnly and non-enumerable'
		expect(o.foo).toBeUndefined();
		updateValue(o, 'foo', 'bar');
		expect(o.foo).toBe('bar');
		expect(Object.getOwnPropertyDescriptor(o, 'foo').writable).toBe(false);
		expect(Object.getOwnPropertyDescriptor(o, 'foo').enumerable).toBe(false);

	});
});
