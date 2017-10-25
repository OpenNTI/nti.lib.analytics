const Instance = Symbol('Instance');
const Events = Symbol('Events');

export class Registry {
	static getInstance () {
		this[Instance] = this[Instance] || new Registry();
		return this[Instance];
	}

	static getEventsForManager (manager) {
		return this.getInstance().getEventsForManager(manager);
	}

	static registerEvent (...args) {
		this.getInstance().register(...args);
	}


	constructor () {
		this[Events] = [];
	}


	getEventFor (name) {
		for (let event of this[Events]) {
			if (event.name === name) {
				return event;
			}
		}
	}


	registerEvent (name, make) {
		const existing = this.getEventFor(name);

		if (existing) { throw new Error('Overriding an existing event.'); }

		this[Events].push({name, make});
	}


	getEventsForManager (manager) {
		return this[Events].reduce((acc, event) => {
			acc[event.name] = event.make(manager);

			return acc;
		}, {});
	}
}

export function register (name) {
	return function dectorator (event) {
		Registry.registerEvent(name, (...args) => event.makeFactory(...args));
	};
}

