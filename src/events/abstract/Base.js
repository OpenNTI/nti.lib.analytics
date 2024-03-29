import { reportError } from '@nti/web-client';
import { defineProtected, updateValue } from '@nti/lib-commons';
export default class BaseAnalyticEvent {
	static EventType = '';
	static Immediate = true;

	static findActiveEvent(manager, resourceId) {
		return manager.findActiveEvent(
			e =>
				e.type === this.EventType &&
				e.resourceId === resourceId &&
				!e.isFinished()
		);
	}

	static makeFactory(manager) {
		const Type = this;

		if (!manager) {
			throw new TypeError('Invalid argument for manager.');
		}

		return {
			send: (resourceId, data) => {
				try {
					const event = new Type(
						this.EventType,
						resourceId,
						data || {},
						manager
					);

					manager.pushEvent(event, this.Immediate);
				} catch (e) {
					reportError(e);
					throw e;
				}
			},
		};
	}

	constructor(type, resourceId, data = {}, manager = {}) {
		const context = data.context || manager.context || [];

		const rootContextId =
			data.rootContextId || data.RootContextID || context[0] || '';
		const user = data.user || manager.user;

		if (!rootContextId) {
			throw new TypeError('No rootContextId defined!');
		}

		if (!user) {
			throw new TypeError('No user defined!');
		}

		Object.defineProperties(this, {
			...defineProtected({
				context,
				data: { ...data },
				manager,
				resourceId,
				rootContextId,
				startTime: new Date(),
				type,
				user,
			}),
		});
	}

	updateData(data) {
		updateValue(this, 'data', { ...this.data, ...data });
	}

	getData() {
		return {
			MimeType: this.type,
			context_path: this.context,
			RootContextID: this.rootContextId,
			timestamp: this.startTime.getTime() / 1000, //send seconds back
			user: this.user,
			ResourceId: this.resourceId,
		};
	}

	onDataSent() {
		this.dataSent = true;
	}

	isFinished() {
		return this.dataSent;
	}
}
