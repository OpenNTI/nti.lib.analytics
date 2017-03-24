import Manager, {LOCAL_STORAGE_KEY} from '../Manager';
import {RESOURCE_VIEWED} from '../MimeTypes';
import {ResourceEvent} from '../models';

import {onBefore, onAfter, hookService} from './Api.spec';

describe('Analytics Manager Class', () => {
	beforeEach(() => (onBefore(), jasmine.clock().install()));
	afterEach(() => (onAfter(), jasmine.clock().uninstall()));

	it ('Constructor has no side effects on timers (does not "init")', ()=> {
		jasmine.clock().uninstall();
		spyOn(global, 'setInterval');
		spyOn(global, 'setTimeout');
		spyOn(global, 'clearInterval');
		spyOn(global, 'clearTimeout');
		spyOn(Manager.prototype, 'init');

		expect(() => new Manager()).not.toThrow();

		expect(Manager.prototype.init).not.toHaveBeenCalled();
		expect(clearTimeout).not.toHaveBeenCalled();
		expect(setTimeout).not.toHaveBeenCalled();
		expect(clearInterval).not.toHaveBeenCalled();
		expect(setInterval).not.toHaveBeenCalled();
	});

	it ('init() starts timers and processes serialized', ()=> {
		const man = new Manager();
		spyOn(man, 'startTimer');
		spyOn(man, 'processSerialized');

		man.init();

		expect(man.startTimer).toHaveBeenCalled();
		expect(man.processSerialized).toHaveBeenCalled();
		expect(man.idleMonitor).toBeTruthy();
	});

	it ('start() throws for unknown event types', ()=> {
		const man = new Manager();
		expect(() => man.start()).toThrow();
		expect(() => man.start({})).toThrow();
		expect(() => man.start(0)).toThrow();
		expect(() => man.start(1)).toThrow();
		expect(() => man.start(new Date())).toThrow();
		expect(() => man.start(true)).toThrow();
		expect(() => man.start(false)).toThrow();
		expect(() => man.start(false)).toThrow();
	});

	it ('start() enqueues an event', () => {
		const event = new ResourceEvent('resourceId', 'course');
		const man = new Manager();
		spyOn(man, 'enqueueEvents');
		expect(() => man.start(event)).not.toThrow();
		expect(man.enqueueEvents).toHaveBeenCalledWith(event);

		event.finish();
	});

	it ('end() marks an event finished', () => {
		const fakeEvent = {finish () {}};
		spyOn(fakeEvent, 'finish');
		const man = new Manager();
		man.end(fakeEvent);
		expect(fakeEvent.finish).toHaveBeenCalled();
	});

	it ('enqueueEvents() appends events, and attempts to serialize queue to localStorage', () => {
		const man = new Manager();
		global.localStorage = global.localStorage || {setItem: () => {}};
		spyOn(localStorage, 'setItem');
		expect(man.queue).toEqual([]);
		man.enqueueEvents(1,2,3);
		expect(man.queue).toEqual([1,2,3]);
		expect(localStorage.setItem).toHaveBeenCalledWith(LOCAL_STORAGE_KEY, '[1,2,3]');
	});

	it ('haltActiveEvents() halts event and filters out irrelevent items', (done) => {
		const event = new ResourceEvent('a', 'b');
		const man = new Manager();

		man.haltActiveEvents([event, 'foo', null, void event, {}])
			.then(events => {

				expect(Array.isArray(events)).toBeTruthy();
				expect(events.length).toBe(1);
				expect(events[0]).toBe(event);

				done();
			})
			.catch(done.fail);
	});

	it ('haltActiveEvents() halts events (internal)', (done) => {
		const event = new ResourceEvent('a', 'b');
		const man = new Manager();

		man.start(event);

		man.haltActiveEvents()
			.then(events => {

				expect(Array.isArray(events)).toBeTruthy();
				expect(events.length).toBe(1);
				expect(events[0]).toBe(event);

				done();
			})
			.catch(done.fail);
	});

	it ('endSession() stops timer, halts events in the queue and processes those events.', (done) => {
		const INTERVAL_ID = {};
		const TIMER_ID = {};
		const service = hookService();
		jasmine.clock().uninstall();
		jasmine.clock().mockDate(Date.now());

		spyOn(global, 'setInterval').and.returnValue(INTERVAL_ID);
		spyOn(global, 'setTimeout').and.returnValue(TIMER_ID);
		spyOn(global, 'clearInterval');
		spyOn(global, 'clearTimeout');

		spyOn(service, 'post').and.callThrough();

		const man = new Manager();
		const event = new ResourceEvent('a', 'b');
		man.startTimer();//fake init

		spyOn(man, 'processQueue');

		man.start(event);

		man.endSession()
			.then(() => {
				expect(clearInterval).toHaveBeenCalledWith(INTERVAL_ID);
				expect(clearTimeout).toHaveBeenCalledWith(TIMER_ID);
				expect(man.processQueue).toHaveBeenCalledTimes(1);
				expect(service.post).toHaveBeenCalledWith('/end_analytics_session', {timestamp: Math.floor(Date.now() / 1000)});

				done();
			})
			.catch(done.fail);
	});

	it ('resumeSession() emits a resume event and starts timers back up', () => {
		const man = new Manager();
		spyOn(man, 'emit');
		spyOn(man, 'startTimer');

		expect(() => man.resumeSession()).not.toThrow();
		expect(man.emit).toHaveBeenCalledWith('resume');
		expect(man.startTimer).toHaveBeenCalledTimes(1);
	});

	it ('processSerialized() reads from localStorage, attempts to process', (done) => {
		const man = new Manager();
		const MimeType = RESOURCE_VIEWED;

		spyOn(man, 'deserialize').and.returnValue([{MimeType, foo: 'bar'},{MimeType, test: true}]);
		spyOn(man, 'enqueueEvents');
		spyOn(man, 'processQueue');

		man.processSerialized()
			.then(() => {
				expect(man.deserialize).toHaveBeenCalled();
				expect(man.enqueueEvents).toHaveBeenCalledWith({MimeType, foo: 'bar'},{MimeType, test: true});
				expect(man.processQueue).toHaveBeenCalled();
				done();
			})
			.catch(done.fail);
	});


	it ('processQueue() - empty queue');
	it ('processQueue() - non-empty queue, none finished');
	it ('processQueue() - non-empty queue, some finished');
});
