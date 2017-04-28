import {definePublic} from 'nti-commons';

import {SELFASSESSMENT_VIEWED} from '../MimeTypes';

import Base from './abstract/Base';


export default class AssessmentEvent extends Base {
	constructor (contentId, rootContextID, assessmentId, mime) {
		super(mime || SELFASSESSMENT_VIEWED, rootContextID);

		if (!assessmentId) {
			console.error('No Assessment ID for Assessment Viewed Analytics Event'); //eslint-disable-line no-console
		}

		Object.defineProperties(this, {
			...definePublic({
				ResourceId: assessmentId,
				ContentId: contentId
			})
		});
	}
}
