import {getLink} from 'nti-lib-interfaces';

const BATCH_EVENT_TYPE = 'application/vnd.nextthought.analytics.batchevents';

function getWorkspace (service) {
	return service && service.getWorkspace('Analytics');
}

function getBeginSessionLink (service) {
	const workspace = getWorkspace(service);

	//TODO: I think workspace may have a getLink method on it
	return workspace && getLink(workspace, 'analytics_session');
}

function getEndSessionLink (service) {
	const workspace = getWorkspace(service);

	return workspace && getLink(workspace, 'end_analytic_session');
}


function getBatchLink (service) {
	const workspace = getWorkspace(service);

	return workspace && getLink(workspace, 'batch_events');
}

export function isAnalyticsEnabled (service) {
	return !!getBatchLink(service);
}


export function beginAnalyticsSession (service) {
	const link = getBeginSessionLink(service);

	//TODO: do we need to check that there is an active one, or should we assume that
	//if we call begin with an active session, its because we failed to end one appropiately?
	return link ?
		(service.hasCookie('nti.da_session') ? Promise.resolve() : service.post(link)) :
		Promise.reject('No link to begin an analytics session');
}


export function endAnalyticsSession (service) {
	const link = getEndSessionLink(service);

	return link ?
		service.post(link) :
		Promise.reject('No link to end an analytics session');
}


export function sendBatchEvents (service, events) {
	const link = getBatchLink(service);
	const payload = {
		MimeType: BATCH_EVENT_TYPE,
		events
	};

	return service.post(link, payload);
}

// import {getService} from 'nti-web-client';
// import {getLink} from 'nti-lib-interfaces';
// const NOT_IMPLEMENTED = 501; //HTTP 501 means not implemented

// function getAnalyticsWorkspace () {
// 	return getService()
// 		.then(service => ({service, workspace: service.getWorkspace('Analytics')}));
// }


// export function ensureAnalyticsSession () {
// 	return getAnalyticsWorkspace()
// 		.then(({service, workspace}) => {

// 			const url = getLink(workspace, 'analytics_session');
// 			return url
// 				? (service.hasCookie('nti.da_session') ? Promise.resolve() : service.post(url))
// 				: Promise.reject('No link for analytics_session.');
// 		});
// }


// export function endAnalyticsSession () {
// 	return getAnalyticsWorkspace()
// 		.then(({service, workspace}) => {
// 			const url = getLink(workspace, 'end_analytics_session');
// 			return url
// 				? service.post(url, { timestamp: Math.floor(new Date() / 1000) })
// 				: Promise.reject('No link for end_analytics_session.');
// 		});
// }


// export function postAnalytics (events) {
// 	return getAnalyticsWorkspace()
// 		.then(({service, workspace}) => {
// 			const url = getLink(workspace, 'batch_events');

// 			const payload = {
// 				MimeType: 'application/vnd.nextthought.analytics.batchevents',
// 				events: events
// 			};

// 			if (!url) {
// 				return Promise.reject({
// 					statusCode: NOT_IMPLEMENTED,
// 					message: 'No Analytics End-point.'
// 				});
// 			}

// 			return ensureAnalyticsSession()
// 				.then(() => service.post(url, payload));
// 		});
// }
