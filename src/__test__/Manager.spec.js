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
		test('calls onHeartBeat with force', () => {
			const manager = getManager('suspend-with-active');

			jest.spyOn(manager, 'onHeartBeat');

			manager.suspendEvents();

			expect(manager.onHeartBeat).toHaveBeenCalledWith(true);
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

		test('calls onHeartBeat with force', () => {
			const manager = getManager('resume-sends-active-events');

			manager.suspendEvents();

			jest.spyOn(manager, 'onHeartBeat');
			manager.resumeEvents();

			expect(manager.onHeartBeat).toHaveBeenCalledWith(true);
		});
	});
});
