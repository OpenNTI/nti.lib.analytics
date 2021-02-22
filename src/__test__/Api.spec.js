/* eslint-env jest */
import {
	isAnalyticsEnabled,
	beginAnalyticsSession,
	endAnalyticsSession,
	sendBatchEvents,
} from '../Api';

export const BEGIN_SESSION = '/analytics_session';
export const END_SESSION = '/end_analytics_session';
export const BATCH_EVENT = '/batch_events';

export const mockService = (disabled, hasCookie, noConnection, rejectPost) => {
	const service = {
		getWorkspace: () => {
			return disabled
				? null
				: {
						Links: [
							{
								rel: 'analytics_session',
								href: BEGIN_SESSION,
							},
							{
								rel: 'end_analytics_session',
								href: END_SESSION,
							},
							{
								rel: 'batch_events',
								href: BATCH_EVENT,
							},
						],
						getLink(rel) {
							return (this.Links.find(x => x.rel === rel) || {})
								.href;
						},
				  };
		},
		hasCookie: () => hasCookie,
		post: () =>
			noConnection
				? Promise.reject({ statusCode: 0 })
				: rejectPost
				? Promise.reject({ statusCode: 422 })
				: Promise.resolve({ statusCode: 200 }),
	};

	jest.spyOn(service, 'post');

	return service;
};

describe('Analytic API', () => {
	describe('isAnalyticsEnabled', () => {
		test('is enabled if given the workspace with the batch_events link', () => {
			const service = mockService();

			expect(isAnalyticsEnabled(service)).toBeTruthy();
		});

		test('is disabled if not given a workspace with the batch_events link', () => {
			const service = mockService(true);

			expect(isAnalyticsEnabled(service)).toBeFalsy();
		});
	});

	describe('beginAnalyticSession', () => {
		test('posts to the analytic_session link if its there, and there is no cookie', () => {
			const service = mockService();

			expect(beginAnalyticsSession(service)).resolves.toEqual(
				expect.anything()
			);
			expect(service.post).toHaveBeenCalledWith(
				BEGIN_SESSION,
				expect.anything()
			);
		});

		test('if there is a link, and there is a cookie it resolves without posting', () => {
			const service = mockService(false, true);

			expect(beginAnalyticsSession(service)).resolves.toEqual(
				expect.anything()
			);
			expect(service.post).not.toHaveBeenCalled();
		});

		test('if there is no link it rejects', () => {
			const service = mockService(true);

			expect(beginAnalyticsSession(service)).rejects.toEqual(
				'No link to begin an analytics session'
			);
			expect(service.post).not.toHaveBeenCalled();
		});
	});

	describe('endAnalyticsSession', () => {
		test('posts to the end_analytics_session link if its there', () => {
			const service = mockService();

			expect(endAnalyticsSession(service)).resolves.toEqual(
				expect.anything()
			);
			expect(service.post).toHaveBeenCalledWith(
				END_SESSION,
				expect.anything()
			);
		});

		test('rejects if not given an end_analytics_session link', () => {
			const service = mockService(true);

			expect(endAnalyticsSession(service)).rejects.toEqual(
				'No link to end an analytics session'
			);
			expect(service.post).not.toHaveBeenCalled();
		});
	});

	describe('sendBatchEvents', () => {
		test('posts to batch_events if given the link', () => {
			const service = mockService();
			const data = [{ id: 1 }, { id: 2 }];

			expect(sendBatchEvents(service, data)).resolves.toEqual(
				expect.anything()
			);

			const { calls } = service.post.mock;

			expect(calls.length).toEqual(1);

			const call = calls[0];

			expect(call[0]).toEqual(BATCH_EVENT);
			expect(call[1].MimeType).toEqual(
				'application/vnd.nextthought.analytics.batchevents'
			);
			expect(call[1].events).toEqual(data);
		});

		test('rejects if not given the batch_events link', () => {
			const service = mockService(true);
			const data = [{ id: 1 }, { id: 2 }];

			expect(sendBatchEvents(service, data)).rejects.toEqual(
				'No link to send batch events'
			);
			expect(service.post).not.toHaveBeenCalled();
		});
	});
});
