import {defineProtected, updateValue} from 'nti-commons';
import Logger from 'nti-util-logger';

import {sendBatchEvents} from './Api';

const logger = Logger.get('analytics:Messages');

const FLUSH_WAIT = 100;

export default class Messages {

	constructor (key, storage) {
		Object.defineProperties(this, {
			...defineProtected({
				stack: [],
				pending: [],
				key: `${key}-pending-analytic-events`,
				storage,
				suspended: false,
				service: null
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
		updateValue(this, 'service', service);

		this.flushMessages();
	}


	send (message) {
		this.stack.push(message);

		if (!this.flushTimeout) {
			this.flushTimeout = setTimeout(() => {
				this.flushTimeout = null;
				this.flushMessages();
			}, FLUSH_WAIT);
		}
	}


	getDataForBatch () {
		return [...this.stack, ...this.getPending()];
	}

	clear () {
		this.setPending([]);
		updateValue(this, 'stack', []);
	}

	async flushMessages () {
		const data = this.getDataForBatch();

		//if there's no data, no need to send
		if (!data.length) { return; }

		//clear all pending, since we are fixing to try to send them
		this.clear();

		//if we don't have a service or are suspended mark the data as pending
		if (!this.service || this.suspended) {
			this.setPending(data);
			return;
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
			updateValue(this, 'pending', pending);
		}
	}

	getPending () {
		if (!this.storage) { return this.pending; }

		try {
			const stored = this.storage.getItem(this.key);
			const pending = stored ? JSON.parse(stored) : [];

			if (!Array.isArray(pending)) { throw new Error('Invalid analytic messages stored.'); }

			return pending;
		} catch (e) {
			logger.error('Invalid analytic messages stored.\nError:', e);
			return [];
		}
	}
}