/* eslint-env jest */
import {updateValue} from 'nti-commons';

import Manager from '../Manager';

import {mockService} from './Api.spec';

function mockEvent (data, finished, shouldUpdate) {
	const event = {
		onDataSent: () => {},
		getData: () => data,
		isFinished: () => finished,
		shouldUpdate: () => shouldUpdate,
		suspend: () => {},
		resume: () => {}
	};

	jest.spyOn(event, 'suspend');
	jest.spyOn(event, 'resume');

	return event;
}

function getManager (name) {
	const manager = new Manager(name);
	const service = mockService();

	manager.setService(service);

	updateValue(manager, 'messages', {
		send: () => {},
		suspend: () => {},
		resume: () => {}
	});

	updateValue(manager, 'heartbeat', {
		start: () => {},
		stop: () => {}
	});

	jest.spyOn(manager.messages, 'send');
	jest.spyOn(manager.messages, 'suspend');
	jest.spyOn(manager.messages, 'resume');

	jest.spyOn(manager.heartbeat, 'start');
	jest.spyOn(manager.heartbeat, 'stop');

	return manager;
}

describe('Analytics Manager Test', () => {
	describe('Exposes All Events', () => {
		const manager = new Manager('test');

		function timedEventExists (event) {
			expect(event).toBeTruthy();
			expect(event.start).toBeTruthy();
			expect(event.stop).toBeTruthy();
		}

		test('AssessmentView', () => {
			timedEventExists(manager.AssessmentView);
		});

		test('AssignmentView', () => {
			timedEventExists(manager.AssignmentView);
		});

		test('CourseCatalogView', () => {
			timedEventExists(manager.CourseCatalogView);
		});

		test('NoteView', () => {
			timedEventExists(manager.NoteView);
		});

		test('ProfileAboutView', () => {
			timedEventExists(manager.ProfileAboutView);
		});

		test('ProfileActivityView', () => {
			timedEventExists(manager.ProfileActivityView);
		});

		test('ProfileMembershipView', () => {
			timedEventExists(manager.ProfileMembershipView);
		});

		test('ResourceView', () => {
			timedEventExists(manager.ResourceView);
		});

		test('ThoughtView', () => {
			timedEventExists(manager.ThoughtView);
		});

		test('TopicView', () => {
			timedEventExists(manager.TopicView);
		});
	});

	describe('setService', () => {
		test('Sets disabled when no workspace', () => {
			const manager = new Manager('test-disabled');

			expect(manager.disabled).toBeFalsy();

			manager.setService(mockService(true));

			expect(manager.disabled).toBeTruthy();
		});

		test('Passes service to Messages when there is a workspace', () => {
			const manager = new Manager('test-enabled');
			const service = mockService();

			jest.spyOn(manager.messages, 'setService');

			manager.setService(service);

			expect(manager.disabled).toBeFalsy();
			expect(manager.messages.setService).toHaveBeenCalledWith(service);
		});
	});

	describe('pushEvent', () => {
		test('immediate finished events, call send and do not start the heartbeat', () => {
			const manager = getManager('immediate-finished-event');
			const data = {test: 'a'};
			const event = mockEvent(data, true);

			manager.pushEvent(event, true);

			expect(manager.messages.send).toHaveBeenCalledWith(data);
			expect(manager.heartbeat.start).not.toHaveBeenCalled();

			expect(manager.activeEvents.length).toEqual(0);
		});


		test('immediate not finished events; push to active, call send, and do call start', () => {
			const manager = getManager('immediate-not-finished-events');
			const data = {test: 'b'};
			const event = mockEvent(data, false);

			manager.pushEvent(event, true);

			expect(manager.messages.send).toHaveBeenCalledWith(data);
			expect(manager.heartbeat.start).toHaveBeenCalled();

			expect(manager.activeEvents.length).toEqual(1);
			expect(manager.activeEvents[0]).toEqual(event);
		});

		test('not immediate not finished events; push to active, do not call send, and do call start', () => {
			const manager = getManager('not-immediate-not-finished-events');
			const data = {test: 'c'};
			const event = mockEvent(data, false);

			manager.pushEvent(event, false);

			expect(manager.messages.send).not.toHaveBeenCalled();
			expect(manager.heartbeat.start).toHaveBeenCalled();

			expect(manager.activeEvents.length).toEqual(1);
			expect(manager.activeEvents[0]).toEqual(event);
		});

		test('when disabled push does nothing', () => {
			const manager = getManager('disabled-push');
			const event = mockEvent({}, false);

			manager.setService(mockService(true));

			manager.pushEvent(event, true);

			expect(manager.messages.send).not.toHaveBeenCalled();
			expect(manager.heartbeat.start).not.toHaveBeenCalled();

			expect(manager.activeEvents.length).toEqual(0);
		});
	});

	describe('onHeartBeat', () => {
		test('no updates all finished, clears the active events', () => {
			const manager = getManager('heartbeat-no-updates-all-finished');
			const data = {test: 'a'};
			const event = mockEvent(data, true, false);

			updateValue(manager, 'activeEvents', [event]);

			manager.onHeartBeat();

			expect(manager.messages.send).not.toHaveBeenCalled();

			expect(manager.activeEvents.length).toEqual(0);
		});

		test('updates and all finished, clears the active and sends messages', () => {
			const manager = getManager('heartbeat-updates-all-finished');
			const data = {test: 'b'};
			const event = mockEvent(data, true, true);

			updateValue(manager, 'activeEvents', [event]);

			manager.onHeartBeat();

			expect(manager.messages.send).toHaveBeenCalledWith(data);

			expect(manager.activeEvents.length).toEqual(0);
		});

		test('updates and not finished, keeps the active and sends the messages', () => {
			const manager = getManager('heartbeat-update-not-finished');
			const data = {test: 'c'};
			const event = mockEvent(data, false, true);

			updateValue(manager, 'activeEvents', [event]);

			manager.onHeartBeat();

			expect(manager.messages.send).toHaveBeenCalledWith(data);

			expect(manager.activeEvents.length).toEqual(1);
			expect(manager.activeEvents[0]).toEqual(event);
		});

		test('passing force, sends the active events even if they aren\'t marked for update', () => {
			const manager = getManager('heartbeat-update-force');
			const data = {test: 'b'};
			const event = mockEvent(data, false, false);

			updateValue(manager, 'activeEvents', [event]);

			manager.onHeartBeat(true);

			expect(manager.messages.send).toHaveBeenCalledWith(data);

			expect(manager.activeEvents.length).toEqual(1);
			expect(manager.activeEvents[0]).toEqual(event);
		});
	});

	describe('suspendEvents', () => {
		test('sends all active events', () => {
			const manager = getManager('suspend-with-active');
			const data = {test: 'a'};
			const event = mockEvent(data, false, false);

			updateValue(manager, 'activeEvents', [event]);

			manager.suspendEvents();

			expect(manager.messages.send).toHaveBeenCalledWith(data);
		});

		test('stops the heart beat', () => {
			const manager = getManager('suspend-stops-heart-beat');

			manager.suspendEvents();

			expect(manager.heartbeat.start).not.toHaveBeenCalled();
			expect(manager.heartbeat.stop).toHaveBeenCalled();
		});

		test('suspends messages too', () => {
			const manager = getManager('suspends-suspends-messages');

			manager.suspendEvents();

			expect(manager.messages.suspend).toHaveBeenCalled();
			expect(manager.messages.resume).not.toHaveBeenCalled();
		});

		test('calls suspend on all active events', () => {
			const manager = getManager('suspends-suspends-events');
			const event = mockEvent({}, false, true);

			updateValue(manager, 'activeEvents', [event]);

			manager.suspendEvents();

			expect(event.suspend).toHaveBeenCalled();
			expect(event.resume).not.toHaveBeenCalled();
		});

		test('pushing non-finished event does not start heartbeat', () => {
			const manager = getManager('suspended-push-event');
			const event = mockEvent({}, false, true);

			manager.suspendEvents();
			manager.pushEvent(event);

			expect(manager.heartbeat.start).not.toHaveBeenCalled();
		});
	});

	describe('resumeEvents', () => {
		test('throws if not suspended', () => {
			const manager = getManager('resume-throws-if-not-suspended');

			expect(manager.resumeEvents).toThrow();
		});

		test('resumes messages too', () => {
			const manager = getManager('resumes-messages-too');

			manager.suspendEvents();
			manager.resumeEvents();

			expect(manager.messages.resume).toHaveBeenCalled();
		});

		test('starts the heartbeat', () => {
			const manager = getManager('resume-starts-heartbeat');

			manager.suspendEvents();
			manager.resumeEvents();

			expect(manager.heartbeat.start).toHaveBeenCalled();
		});

		test('sends active events', () => {
			const manager = getManager('resume-sends-active-events');
			const data = {test: 't'};
			const event = mockEvent(data, false, true);

			updateValue(manager, 'activeEvents', [event]);

			manager.suspendEvents();
			manager.resumeEvents();

			expect(manager.messages.send).toHaveBeenCalledWith(data);
		});
	});
});



// import {Date as DateUtils} from 'nti-commons';

// import Manager, {LOCAL_STORAGE_KEY} from '../Manager';
// import {RESOURCE_VIEWED} from '../MimeTypes';
// import {ResourceEvent} from '../models';

// import {onBefore, onAfter, hookService} from './Api.spec';

// describe('Analytics Manager Class', () => {
// 	jest.useFakeTimers();
// 	beforeEach(() => (onBefore(), DateUtils.MockDate.install()));
// 	afterEach(() => {
// 		onAfter();
// 		DateUtils.MockDate.uninstall();
// 		jest.resetAllMocks();
// 		jest.clearAllMocks();
// 	});

// 	test ('Constructor has no side effects on timers (does not "init")', ()=> {
// 		spyOn(Manager.prototype, 'init');

// 		expect(() => new Manager()).not.toThrow();

// 		expect(Manager.prototype.init).not.toHaveBeenCalled();
// 		expect(clearTimeout).not.toHaveBeenCalled();
// 		expect(setTimeout).not.toHaveBeenCalled();
// 		expect(clearInterval).not.toHaveBeenCalled();
// 		expect(setInterval).not.toHaveBeenCalled();
// 	});

// 	test ('init() starts timers and processes serialized', ()=> {
// 		const man = new Manager();
// 		spyOn(man, 'startTimer');
// 		spyOn(man, 'processSerialized');

// 		man.init();

// 		expect(man.startTimer).toHaveBeenCalled();
// 		expect(man.processSerialized).toHaveBeenCalled();
// 		expect(man.idleMonitor).toBeTruthy();
// 	});

// 	test ('start() throws for unknown event types', ()=> {
// 		const man = new Manager();
// 		expect(() => man.start()).toThrow();
// 		expect(() => man.start({})).toThrow();
// 		expect(() => man.start(0)).toThrow();
// 		expect(() => man.start(1)).toThrow();
// 		expect(() => man.start(new Date())).toThrow();
// 		expect(() => man.start(true)).toThrow();
// 		expect(() => man.start(false)).toThrow();
// 		expect(() => man.start(false)).toThrow();
// 	});

// 	test ('start() enqueues an event', () => {
// 		const event = new ResourceEvent('resourceId', 'course');
// 		const man = new Manager();
// 		spyOn(man, 'enqueueEvents');
// 		expect(() => man.start(event)).not.toThrow();
// 		expect(man.enqueueEvents).toHaveBeenCalledWith(event);

// 		event.finish();
// 	});

// 	test ('end() marks an event finished', () => {
// 		const fakeEvent = {finish () {}};
// 		spyOn(fakeEvent, 'finish');
// 		const man = new Manager();
// 		man.end(fakeEvent);
// 		expect(fakeEvent.finish).toHaveBeenCalled();
// 	});

// 	test ('enqueueEvents() appends events, and attempts to serialize queue to localStorage', () => {
// 		const man = new Manager();
// 		global.localStorage = global.localStorage || {setItem: () => {}};
// 		spyOn(global.localStorage, 'setItem');
// 		expect(man.queue).toEqual([]);
// 		man.enqueueEvents(1,2,3);
// 		expect(man.queue).toEqual([1,2,3]);
// 		expect(global.localStorage.setItem).toHaveBeenCalledWith(LOCAL_STORAGE_KEY, '[1,2,3]');
// 	});

// 	test ('haltActiveEvents() halts event and filters out irrelevent items', (done) => {
// 		const event = new ResourceEvent('a', 'b');
// 		const man = new Manager();

// 		man.haltActiveEvents([event, 'foo', null, void event, {}])
// 			.then(events => {

// 				expect(Array.isArray(events)).toBeTruthy();
// 				expect(events.length).toBe(1);
// 				expect(events[0]).toBe(event);

// 				done();
// 			})
// 			.catch(done.fail);
// 	});

// 	test ('haltActiveEvents() halts events (internal)', (done) => {
// 		const event = new ResourceEvent('a', 'b');
// 		const man = new Manager();

// 		man.start(event);

// 		man.haltActiveEvents()
// 			.then(events => {

// 				expect(Array.isArray(events)).toBeTruthy();
// 				expect(events.length).toBe(1);
// 				expect(events[0]).toBe(event);

// 				done();
// 			})
// 			.catch(done.fail);
// 	});

// 	test ('endSession() stops timer, halts events in the queue and processes those events.', (done) => {
// 		const INTERVAL_ID = {};
// 		const TIMER_ID = {};
// 		const service = hookService();
// 		DateUtils.MockDate.uninstall();
// 		DateUtils.MockDate.install(Date.now());

// 		spyOn(global, 'setInterval').and.returnValue(INTERVAL_ID);
// 		spyOn(global, 'setTimeout').and.returnValue(TIMER_ID);
// 		spyOn(global, 'clearInterval');
// 		spyOn(global, 'clearTimeout');

// 		spyOn(service, 'post').and.callThrough();

// 		const man = new Manager();
// 		const event = new ResourceEvent('a', 'b');
// 		man.startTimer();//fake init

// 		spyOn(man, 'processQueue');

// 		man.start(event);

// 		man.endSession()
// 			.then(() => {
// 				expect(clearInterval).toHaveBeenCalledWith(INTERVAL_ID);
// 				expect(clearTimeout).toHaveBeenCalledWith(TIMER_ID);
// 				expect(man.processQueue).toHaveBeenCalledTimes(1);
// 				expect(service.post).toHaveBeenCalledWith('/end_analytics_session', {timestamp: Math.floor(Date.now() / 1000)});

// 				done();
// 			})
// 			.catch(done.fail);
// 	});

// 	test ('resumeSession() emits a resume event and starts timers back up', () => {
// 		const man = new Manager();
// 		spyOn(man, 'emit');
// 		spyOn(man, 'startTimer');

// 		expect(() => man.resumeSession()).not.toThrow();
// 		expect(man.emit).toHaveBeenCalledWith('resume');
// 		expect(man.startTimer).toHaveBeenCalledTimes(1);
// 	});

// 	test ('processSerialized() reads from localStorage, attempts to process', (done) => {
// 		const man = new Manager();
// 		const MimeType = RESOURCE_VIEWED;

// 		spyOn(man, 'deserialize').and.returnValue([{MimeType, foo: 'bar'},{MimeType, test: true}]);
// 		spyOn(man, 'enqueueEvents');
// 		spyOn(man, 'processQueue');

// 		man.processSerialized()
// 			.then(() => {
// 				expect(man.deserialize).toHaveBeenCalled();
// 				expect(man.enqueueEvents).toHaveBeenCalledWith(
// 					expect.objectContaining({MimeType, foo: 'bar'}),
// 					expect.objectContaining({MimeType, test: true})
// 				);
// 				expect(man.processQueue).toHaveBeenCalled();
// 				done();
// 			})
// 			.catch(done.fail);
// 	});


// 	test ('processQueue() - empty queue');
// 	test ('processQueue() - non-empty queue, none finished');
// 	test ('processQueue() - non-empty queue, some finished');
// });
