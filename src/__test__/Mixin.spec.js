import Mixin, {CURRENT_EVENT} from '../Mixin';
import Manager from '../Manager';
import {RESOURCE_VIEWED, ASSIGNMENT_VIEWED, SELFASSESSMENT_VIEWED} from '../MimeTypes';
import {initAnalytics, reset} from '../Interface';

const SOME_ASSIGNMENT = 'tag:nextthought.com,2011-10:NTIAlpha-NAQ-NTI1000_TestCourse.naq.asg.assignment:content_essay';
const SOME_COURSEINST = 'tag:nextthought.com,2011-10:system-OID-0x317ef2:5573657273:KnXf1MmK2VB';
const SOME_PAGE = 'tag:nextthought.com,2011-10:NTIAlpha-HTML-NTI1000_TestCourse.abc:xyz';

function fakeInit () {
	spyOn(Manager.prototype, 'init');
	spyOn(Manager.prototype, 'start');
	initAnalytics();
}

describe('Analytics Mixin', () => {
	beforeEach(() => jasmine.clock().install());

	afterEach(() => (reset(), jasmine.clock().uninstall()));


	it ('resourceLoaded() base case', (done) => {
		const thing = {...Mixin, resourceUnloaded: () => Promise.resolve()};

		fakeInit();

		Promise.resolve()
			.then(() => thing.resourceLoaded(SOME_PAGE, SOME_COURSEINST, RESOURCE_VIEWED)
				.then(() => {
					const event = thing[CURRENT_EVENT];
					expect(event).toBeTruthy();
					expect(event.RootContextID).toBe(SOME_COURSEINST);
					expect(event.resource_id).toBe(SOME_PAGE);
					expect(event.MimeType).toBe(RESOURCE_VIEWED);

					event.finish();//cleanup event
				})
			)
			.then(done, done.fail);
	});

	it ('resourceLoaded() arguments do not get remapped', (done) => {
		const thing1 = {...Mixin, resourceUnloaded: () => Promise.resolve()};
		const thing2 = {...Mixin, resourceUnloaded: () => Promise.resolve()};

		fakeInit();

		Promise.resolve()
			.then(() => thing1.resourceLoaded([SOME_ASSIGNMENT, SOME_PAGE], SOME_COURSEINST, ASSIGNMENT_VIEWED)
				.then(() => {
					const event = thing1[CURRENT_EVENT];
					expect(event).toBeTruthy();

					expect(event.RootContextID).toBe(SOME_COURSEINST);
					expect(event.ResourceId).toBe(SOME_ASSIGNMENT),
					expect(event.ContentId).toBe(SOME_PAGE);
					expect(event.MimeType).toBe(ASSIGNMENT_VIEWED);

					event.finish();//cleanup event
				})
			)
			.then(() => thing2.resourceLoaded([SOME_ASSIGNMENT, SOME_PAGE], SOME_COURSEINST, SELFASSESSMENT_VIEWED)
				.then(() => {
					const event = thing2[CURRENT_EVENT];

					expect(event).toBeTruthy();
					expect(event.RootContextID).toBe(SOME_COURSEINST);
					expect(event.ResourceId).toBe(SOME_ASSIGNMENT),
					expect(event.ContentId).toBe(SOME_PAGE);
					expect(event.MimeType).toBe(SELFASSESSMENT_VIEWED);

					event.finish();//cleanup event
				})
			)
			.then(done, done.fail);
	});

});
