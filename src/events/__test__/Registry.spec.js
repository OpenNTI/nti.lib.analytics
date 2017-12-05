/* eslint-env jest */
import {Registry} from '../Registry';

const Instance = Symbol.for('Instance');

const FAKE = 'fake';
const FAKE_FACTORY = () => FAKE;

describe('Analytics Registry', () => {

	beforeEach(() => {
		delete Registry[Instance];
	});

	test('registerEvent()', () => {
		expect(Registry.registerEvent(FAKE, FAKE_FACTORY)).toBeUndefined();
		expect(Registry.getInstance().getEventFor(FAKE)).toEqual({name: FAKE, make: FAKE_FACTORY});

		expect(() => Registry.registerEvent(FAKE, () => {})).toThrow();
	});

	test('getEventsForManager()', () => {
		Registry.registerEvent(FAKE, FAKE_FACTORY);
		expect(Registry.getEventsForManager({})).toEqual({
			[FAKE]: FAKE
		});
	});
});
