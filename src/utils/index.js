export function filterContextPath (context, resourceId) {
	let first = context[0];
	let last = context[context.length - 1];

	// if the end of the path is the resourceId then drop it.
	// if the end of the path is not, leave it be.
	// Its OKAY if its not. (Use case: Clicking a `Card`, the
	// path is everything BUT the resource, and the cards' target
	// is the resource)
	last = (last && (last.ntiid === resourceId || last === resourceId)) ? -1 : undefined;

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
		.map(x=> x.ntiid || (typeof x === 'string' ? x : null))
		.filter(x=>x);
}



export const isFunction = x => typeof x === 'function';


export const readOnly = (value, enumerable = false) => ({configurable: true, enumerable, writable: false, value});


export function updateValue (scope, key, value) {
	const desc = Object.getOwnPropertyDescriptor(scope, key) || readOnly(value);
	delete scope[key];
	Object.defineProperty(scope, key, Object.assign({}, desc, {value}));
}


export const definePublic = (o) =>
	Object.entries(o).reduce((out, [key, value]) => (out[key] = readOnly(value, true), out), {});


export const defineProtected = (o) =>
	Object.entries(o).reduce((out, [key, value]) => (out[key] = readOnly(value), out), {});