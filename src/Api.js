import { reportError } from '@nti/web-client';

const BATCH_EVENT_TYPE = 'application/vnd.nextthought.analytics.batchevents';
const BATCH_EVENTS_REL = 'batch_events';
const SESSION_END = 'end_analytics_session';
const SESSION_BEGIN = 'analytics_session';

const getWorkspaceLink = (service, rel) =>
	service?.getWorkspace('Analytics')?.getLink?.(rel);

export const isAnalyticsEnabled = service =>
	!!getWorkspaceLink(service, BATCH_EVENTS_REL);

export const beginAnalyticsSession = service => post(service, SESSION_BEGIN);
export const endAnalyticsSession = service => post(service, SESSION_END);
export const sendBatchEvents = (service, events) =>
	post(service, BATCH_EVENTS_REL, {
		MimeType: BATCH_EVENT_TYPE,
		events,
	});

async function post(service, rel, payload = {}) {
	try {
		const link = getWorkspaceLink(service, rel);
		if (!link) {
			throw new Error('No Link: ' + rel);
		}

		if (rel === SESSION_END && global?.navigator?.sendBeacon) {
			return global.navigator.sendBeacon(link, '{}');
		}

		return await service.post(link, payload);
	} catch (e) {
		reportError(e);
		throw e;
	}
}
