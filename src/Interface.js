import Manager from './Manager';

let manager;//instance tracking pointer

function wrap (fn) {
	try {
		return fn();
	} catch (e) {
		throw !manager ? new Error('analytics have not been properly initialized yet.') : e;
	}
}

//for tests
export function reset () { manager = void 0; }

export function initAnalytics () {
	if (!manager) {
		manager = new Manager();
		manager.init();
	}
}

export function eventStarted (event) {
	return wrap(() => manager.start(event));
}


export function eventEnded (event) {
	return wrap(() => manager.end(event));
}


export function endSession () {
	return wrap(() => manager.endSession());
}


export function resumeSession () {
	return wrap(() => manager.resumeSession());
}


export function addResumeListener (fn) {
	return wrap(() => manager.addResumeListener(fn));
}

export function removeResumeListener (fn) {
	return wrap(() => manager.removeResumeListener(fn));
}
