import {Date as DateUtils} from 'nti-commons';
import {TestUtils} from 'nti-web-client';

import {ensureAnalyticsSession, endAnalyticsSession, postAnalytics} from '../Api';

export const mockService = () => ({
	getWorkspace: () => ({
		Links: [
			{
				rel: 'analytics_session',
				href: '/analytics_session'
			},
			{
				rel: 'end_analytics_session',
				href: '/end_analytics_session'
			},
			{
				rel: 'batch_events',
				href: '/batch_events'
			}
		]
	}),
	hasCookie: () => true,
	post: () => Promise.resolve({statusCode: 200})
});

export const hookService = (o) => TestUtils.hookService(o);

export const onBefore = () => {
	TestUtils.setupTestClient(mockService());
};

export const onAfter = () => {
	DateUtils.MockDate.uninstall();
	TestUtils.tearDownTestClient();
};

describe('API', () => {

	beforeEach(onBefore);
	afterEach(onAfter);

	test ('ensureAnalyticsSession success (already has cookie)', (done) => {
		const service = hookService();
		jest.spyOn(service, 'getWorkspace');
		jest.spyOn(service, 'post').mockImplementation(() => {});
		ensureAnalyticsSession().then(() => {

			expect(service.getWorkspace).toHaveBeenCalledWith('Analytics');
			expect(service.getWorkspace).toHaveBeenCalledTimes(1);
			expect(service.post).not.toHaveBeenCalled();
			done();

		}, done.fail);
	});

	test ('ensureAnalyticsSession success (no cookie)', (done) => {
		const service = hookService({
			hasCookie: () => false
		});

		jest.spyOn(service, 'getWorkspace');
		jest.spyOn(service, 'post');

		ensureAnalyticsSession().then(() => {

			expect(service.getWorkspace).toHaveBeenCalledWith('Analytics');
			expect(service.getWorkspace).toHaveBeenCalledTimes(1);
			expect(service.post).toHaveBeenCalledWith('/analytics_session');
			done();

		}, done.fail);
	});

	test ('ensureAnalyticsSession failure (no link)', (done) => {
		hookService({
			getWorkspace: () => ({})
		});

		ensureAnalyticsSession().then(
			() => done.fail('should have called rejection'),
			(reason) => {
				expect(reason).toBe('No link for analytics_session.');
				done();
			});
	});

	test ('ensureAnalyticsSession failure', (done) => {
		const service = hookService({
			hasCookie: () => false,
			post: () => Promise.reject({statusCode: 500})
		});

		jest.spyOn(service, 'getWorkspace');
		jest.spyOn(service, 'post');

		ensureAnalyticsSession().then(
			() => done.fail('should have called rejection'),
			() => {
				expect(service.getWorkspace).toHaveBeenCalledWith('Analytics');
				expect(service.getWorkspace).toHaveBeenCalledTimes(1);
				expect(service.post).toHaveBeenCalledWith('/analytics_session');
				done();
			});
	});


	test ('endAnalyticsSession success', (done) => {
		DateUtils.MockDate.install();
		const service = hookService();

		jest.spyOn(service, 'post');

		endAnalyticsSession()
			.then((resp) => {

				expect(service.post).toHaveBeenCalledWith('/end_analytics_session', {timestamp: Math.floor(Date.now() / 1000)});
				expect(resp.statusCode).toBeTruthy();

				done();
			})
			.catch(done.fail);
	});

	test ('endAnalyticsSession failure (no link)', (done) => {
		hookService({
			getWorkspace: () => ({})
		});

		endAnalyticsSession()
			.then(done.fail)
			.catch(reason => {
				expect(reason).toBe('No link for end_analytics_session.');
				done();
			});
	});

	test ('endAnalyticsSession failure (other)', (done) => {
		hookService({
			post: () => Promise.reject({statusCode: 500})
		});

		endAnalyticsSession()
			.then(done.fail)
			.catch(reason => {
				expect(reason).toBeTruthy();
				expect(reason.statusCode).toBeTruthy();
				done();
			});
	});


	test ('postAnalytics success (no cookie)', (done) => {
		const service = hookService({
			hasCookie: () => false
		});
		jest.spyOn(service, 'post');

		postAnalytics([1,2,3])
			.then(() => {
				expect(service.post).toHaveBeenCalledTimes(2);
				expect(service.post).toHaveBeenCalledWith('/analytics_session');
				expect(service.post).toHaveBeenCalledWith('/batch_events', {
					MimeType: 'application/vnd.nextthought.analytics.batchevents',
					events: [1,2,3]
				});

				done();
			})
			.catch(done.fail);
	});

	test ('postAnalytics success (cookie)', (done) => {
		const service = hookService();
		jest.spyOn(service, 'post');

		postAnalytics([1,2,3])
			.then(() => {
				expect(service.post).toHaveBeenCalledTimes(1);
				expect(service.post).toHaveBeenCalledWith('/batch_events', {
					MimeType: 'application/vnd.nextthought.analytics.batchevents',
					events: [1,2,3]
				});

				done();
			})
			.catch(done.fail);
	});

	test ('postAnalytics failure (no link)', (done) => {
		hookService({
			getWorkspace: () => ({})
		});

		postAnalytics([1,2,3])
			.then(done.fail)
			.catch(reason => {

				expect(reason).toEqual({
					statusCode: 501,
					message: 'No Analytics End-point.'
				});
				done();
			});
	});

	test ('postAnalytics failure (other)', (done) => {
		hookService({
			post: () => Promise.reject({statusCode: 500})
		});

		postAnalytics([1,2,3])
			.then(done.fail)
			.catch(reason => {
				expect(reason).toBeTruthy();
				expect(reason.statusCode).toBeTruthy();
				done();
			});
	});
});
