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
	TestUtils.tearDownTestClient();
};

describe('API', () => {

	beforeEach(onBefore);
	afterEach(onAfter);

	it ('ensureAnalyticsSession success (already has cookie)', (done) => {
		const service = hookService();
		spyOn(service, 'getWorkspace').and.callThrough();
		spyOn(service, 'post');
		ensureAnalyticsSession().then(() => {

			expect(service.getWorkspace).toHaveBeenCalledWith('Analytics');
			expect(service.getWorkspace).toHaveBeenCalledTimes(1);
			expect(service.post).not.toHaveBeenCalled();
			done();

		}, done.fail);
	});

	it ('ensureAnalyticsSession success (no cookie)', (done) => {
		const service = hookService({
			hasCookie: () => false
		});

		spyOn(service, 'getWorkspace').and.callThrough();
		spyOn(service, 'post').and.callThrough();

		ensureAnalyticsSession().then(() => {

			expect(service.getWorkspace).toHaveBeenCalledWith('Analytics');
			expect(service.getWorkspace).toHaveBeenCalledTimes(1);
			expect(service.post).toHaveBeenCalledWith('/analytics_session');
			done();

		}, done.fail);
	});

	it ('ensureAnalyticsSession failure (no link)', (done) => {
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

	it ('ensureAnalyticsSession failure', (done) => {
		const service = hookService({
			hasCookie: () => false,
			post: () => Promise.reject({statusCode: 500})
		});

		spyOn(service, 'getWorkspace').and.callThrough();
		spyOn(service, 'post').and.callThrough();

		ensureAnalyticsSession().then(
			() => done.fail('should have called rejection'),
			() => {
				expect(service.getWorkspace).toHaveBeenCalledWith('Analytics');
				expect(service.getWorkspace).toHaveBeenCalledTimes(1);
				expect(service.post).toHaveBeenCalledWith('/analytics_session');
				done();
			});
	});


	it ('endAnalyticsSession success', (done) => {
		jasmine.clock().mockDate(Date.now());
		const service = hookService();

		spyOn(service, 'post').and.callThrough();

		endAnalyticsSession()
			.then((resp) => {

				expect(service.post).toHaveBeenCalledWith('/end_analytics_session', {timestamp: Math.floor(Date.now() / 1000)});
				expect(resp.statusCode).toBeTruthy();

				done();
			})
			.catch(done.fail);
	});

	it ('endAnalyticsSession failure (no link)', (done) => {
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

	it ('endAnalyticsSession failure (other)', (done) => {
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


	it ('postAnalytics success (no cookie)', (done) => {
		const service = hookService({
			hasCookie: () => false
		});
		spyOn(service, 'post').and.callThrough();

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

	it ('postAnalytics success (cookie)', (done) => {
		const service = hookService();
		spyOn(service, 'post').and.callThrough();

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

	it ('postAnalytics failure (no link)', (done) => {
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

	it ('postAnalytics failure (other)', (done) => {
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
