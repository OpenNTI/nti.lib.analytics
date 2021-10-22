/* eslint-env jest */
import {
	isAnalyticsEnabled,
	beginAnalyticsSession,
	endAnalyticsSession,
	sendBatchEvents,
} from '../Api';

import { mockService, BATCH_EVENT, BEGIN_SESSION, END_SESSION } from './util';

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

		test('if there is a link, and there is a cookie, still posts', () => {
			const service = mockService(false, true);

			expect(beginAnalyticsSession(service)).resolves.toEqual(
				expect.anything()
			);
			expect(service.post).toHaveBeenCalled();
		});

		test('if there is no link it rejects', () => {
			const service = mockService(true);

			expect(beginAnalyticsSession(service)).rejects.toThrowError(
				/No Link: analytics_session/
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

			expect(endAnalyticsSession(service)).rejects.toThrowError(
				/No Link: end_analytics_session/
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

			expect(sendBatchEvents(service, data)).rejects.toThrowError(
				/No Link: batch_events/
			);
			expect(service.post).not.toHaveBeenCalled();
		});
	});
});
