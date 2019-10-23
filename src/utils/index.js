export Interval from './Interval';

function getAnalyticsId (contextPart) {
	if (!contextPart) { return null; }

	return contextPart.analyticsId || contextPart.ntiid || (typeof contextPart === 'string' ? contextPart : null);
}

export function filterContextPath (context, resourceId) {
	let first = context[0];
	let last = context[context.length - 1];

	// if the end of the path is the resourceId then drop it.
	// if the end of the path is not, leave it be.
	// Its OKAY if its not. (Use case: Clicking a `Card`, the
	// path is everything BUT the resource, and the cards' target
	// is the resource)
	last = (last && (getAnalyticsId(last) === resourceId)) ? -1 : undefined;

	//if (!last) {
	// console.debug('The last entry in the context path is not the resource.');
	//}

	first = (typeof first === 'object' && !first.ntiid) ? 1 : 0;
	// if (first) {
	// This is actually OKAY... the root context node is our home view:
	// "/mobile/" which does not have an NTIID.
	// console.warn('Context "root" has no ntiid, omitting: %o', context);
	// }

	if (first || last) {
		context = context.slice(first, last);
	}

	return context;
}


export function toAnalyticsPath (context, resourceId) {
	return filterContextPath(context, resourceId)
		.map(x=> getAnalyticsId(x))
		.filter(x=>x);
}


export function getError (e) {
	/* istanbul ignore next */
	return e.stack || e.message || e;
}
