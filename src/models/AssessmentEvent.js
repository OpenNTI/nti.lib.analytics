import Base from './abstract/Base';
import {SELFASSESSMENT_VIEWED} from '../MimeTypes';

import {definePublic} from '../utils';

export default class AssessmentEvent extends Base {
	constructor (contentId, courseId, assessmentId, mime) {
		super(mime || SELFASSESSMENT_VIEWED, null, courseId);

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
