const Instance = Symbol.for('Instance');
const Events = Symbol('Events');

export class Registry {
	static getInstance() {
		this[Instance] = this[Instance] || new Registry();
		return this[Instance];
	}

	static getEventsForManager(manager) {
		return this.getInstance().getEventsForManager(manager);
	}

	static getTypeForEvent(name) {
		return this.getInstance().getTypeForEvent(name);
	}

	static registerEvent(...args) {
		this.getInstance().registerEvent(...args);
	}

	constructor() {
		this[Events] = [];
	}

	getEventFor(name) {
		for (let event of this[Events]) {
			if (event.name === name) {
				return event;
			}
		}
	}

	registerEvent(name, make, eventType) {
		const existing = this.getEventFor(name);

		if (existing) {
			throw new Error('Overriding an existing event.');
		}

		this[Events].push({ name, make, eventType });
	}

	getEventsForManager(manager) {
		return this[Events].reduce((acc, event) => {
			acc[event.name] = event.make(manager);

			return acc;
		}, {});
	}

	getTypeForEvent(target) {
		for (let event of this[Events]) {
			if (event.name === target) {
				return event.eventType;
			}
		}
	}
}

export function register(name) {
	const decorator = event => {
		Registry.registerEvent(
			name,
			(...args) => event.makeFactory(...args),
			event.EventType
		);
	};

	if (arguments.length > 1) {
		const [, target] = arguments;
		return decorator(target) ?? target;
	}

	return decorator;
}
