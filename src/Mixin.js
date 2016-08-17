import Logger from 'nti-util-logger';
import {decodeFromURI} from 'nti-lib-ntiids';

import {eventStarted, eventEnded, addResumeListener, removeResumeListener} from './Interface';
import {getModel, ResourceEvent} from './models';
import {toAnalyticsPath} from './utils';

const logger = Logger.get('analytics:Mixin');

const onResume = 'ResourceLoaded:onSessionResume';

// keep track of the view start event so we can push analytics including duration
export const CURRENT_EVENT = Symbol('CurrentEvent');


export default {

	componentDidMount () {
		addResumeListener(this[onResume]);
	},

	componentWillUnmount () {
		removeResumeListener(this[onResume]);
	},

	[onResume] () {
		if (this.resumeAnalyticsEvents) {
			this.resumeAnalyticsEvents();
		}
		else {
			logger.warn('Components using ResourceLoaded mixin should implement resumeAnalyticsEvents. (Check %s)', this.constructor.displayName);
		}
	},

	resourceLoaded (resourceId, courseId, eventMimeType) {
		let assessmentId;
		if (arguments.length > 3) {
			[assessmentId, resourceId, courseId, eventMimeType] = [...arguments];
		}

		// wait for resourceUnloaded to finish before creating the
		// new event so we don't change this[CURRENT_EVENT] out from under us.
		return this.resourceUnloaded().then(() => {

			const Type = getModel(eventMimeType) || ResourceEvent; //Dangerous!

			this[CURRENT_EVENT] = new Type(
				decodeFromURI(resourceId),
				courseId,
				assessmentId);

			eventStarted(this[CURRENT_EVENT]);
		});
	},

	resourceUnloaded () {
		if (!this[CURRENT_EVENT] || this[CURRENT_EVENT].finished) {
			return Promise.resolve();
		}

		const {resourceId} = this[CURRENT_EVENT];
		this[CURRENT_EVENT].finish();

		const contextFunction = this.analyticsContext || this.resolveContext;
		return contextFunction(this.props)
			.then(context => {

				this[CURRENT_EVENT].setContextPath(toAnalyticsPath(context, resourceId));

				eventEnded(this[CURRENT_EVENT]);

				this[CURRENT_EVENT] = null;
			});
	}

};
