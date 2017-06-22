import {getService} from 'nti-web-client';
import {getLink} from 'nti-lib-interfaces';
const NOT_IMPLEMENTED = 501; //HTTP 501 means not implemented

function getAnalyticsWorkspace () {
	return getService()
		.then(service => ({service, workspace: service.getWorkspace('Analytics')}));
}


export function ensureAnalyticsSession () {
	return getAnalyticsWorkspace()
		.then(({service, workspace}) => {

			const url = getLink(workspace, 'analytics_session');
			return url
				? (service.hasCookie('nti.da_session') ? Promise.resolve() : service.post(url))
				: Promise.reject('No link for analytics_session.');
		});
}


export function endAnalyticsSession () {
	return getAnalyticsWorkspace()
		.then(({service, workspace}) => {
			const url = getLink(workspace, 'end_analytics_session');
			return url
				? service.post(url, { timestamp: Math.floor(new Date() / 1000) })
				: Promise.reject('No link for end_analytics_session.');
		});
}


export function postAnalytics (events) {
	return getAnalyticsWorkspace()
		.then(({service, workspace}) => {
			const url = getLink(workspace, 'batch_events');

			const payload = {
				MimeType: 'application/vnd.nextthought.analytics.batchevents',
				events: events
			};

			if (!url) {
				return Promise.reject({
					statusCode: NOT_IMPLEMENTED,
					message: 'No Analytics End-point.'
				});
			}

			return ensureAnalyticsSession()
				.then(() => service.post(url, payload));
		});
}
