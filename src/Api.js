const BATCH_EVENT_TYPE = 'application/vnd.nextthought.analytics.batchevents';

function getWorkspace(service) {
	return service && service.getWorkspace('Analytics');
}

function getBeginSessionLink(service) {
	const workspace = getWorkspace(service);

	return workspace && workspace.getLink('analytics_session');
}

function getEndSessionLink(service) {
	const workspace = getWorkspace(service);

	return workspace && workspace.getLink('end_analytics_session');
}

function getBatchLink(service) {
	const workspace = getWorkspace(service);

	return workspace && workspace.getLink('batch_events');
}

export function isAnalyticsEnabled(service) {
	return !!getBatchLink(service);
}

export function beginAnalyticsSession(service) {
	const link = getBeginSessionLink(service);

	//TODO: do we need to check that there is an active one, or should we assume that
	//if we call begin with an active session, its because we failed to end one appropiately?
	return link
		? service.hasCookie('nti.da_session')
			? Promise.resolve(true)
			: service.post(link, {})
		: Promise.reject('No link to begin an analytics session');
}

export function endAnalyticsSession(service) {
	const link = getEndSessionLink(service);

	if (global?.navigator?.sendBeacon) {
		return link
			? global.navigator.sendBeacon(link, JSON.stringify({}))
			: Promise.reject('No link to end an analytics session');
	}

	return link
		? service.post(link, {})
		: Promise.reject('No link to end an analytics session');
}

export function sendBatchEvents(service, events) {
	const link = getBatchLink(service);
	const payload = {
		MimeType: BATCH_EVENT_TYPE,
		events,
	};

	return link
		? service.post(link, payload)
		: Promise.reject('No link to send batch events');
}
