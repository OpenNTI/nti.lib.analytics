import {defineProtected, updateValue} from 'nti-commons';
import Logger from 'nti-util-logger';

import {sendBatchEvents} from './Api';

const logger = Logger.get('analytics:Messages');

const FLUSH_WAIT = 100;

export default class Messages {

	constructor (key, storage) {
		Object.defineProperties(this, {
			...defineProtected({
				messages: [],
				pending: [],
				key: `${key}-pending-analytic-events`,
				storage,
				suspended: false
			})
		});
	}


	suspend () {
		updateValue(this, 'suspended', true);
	}


	resume () {
		updateValue(this, 'suspended', false);

		this.flushMessages();
	}


	setService (service) {
		Object.defineProperties(this, {
			service
		});

		this.flushMessages();
	}


	send (message) {
		this.messages.push(message);

		if (!this.flushTimeout) {
			this.flushTimeout = setTimeout(() => {
				this.flushTimeout = null;
				this.flushMessages();
			}, FLUSH_WAIT);
		}
	}


	async flushMessages () {
		const data = [...this.messages, ...this.getPending()];

		//if there's no data, no need to send
		if (!data.length) { return; }

		this.setPending([]);
		updateValue(this, 'message', []);

		if (!this.service || this.suspended) {
			this.setPending(data);
		}

		try {
			await sendBatchEvents(this.service, data);
		} catch (e) {
			logger.error('Failed to send analytic batch_event.\nError:', e, '\nData:', data);

			//if we failed because of no network connection
			//add the events to the storage to try again later
			if (e && e.statusCode === 0) {
				this.setPending(data);
			}
		}
	}


	setPending (pending) {
		if (this.storage) {
			this.storage.setItem(this.key, JSON.stringify(pending));
		} else {
			this.updateValue(this, 'pending', pending);
		}
	}

	getPending () {
		if (!this.storage) { return this.pending; }

		try {
			const pending = JSON.parse(this.storage.getItem(this.key));

			if (!Array.isArray(pending)) { throw new Error('Invalid analytic messages stored.'); }

			return pending;
		} catch (e) {
			logger.error('Invalid analytic messages stored.\nError:', e);
			return [];
		}
	}
}
