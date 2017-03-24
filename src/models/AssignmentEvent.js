import {ASSIGNMENT_VIEWED} from '../MimeTypes';

import AssessmentEvent from './AssessmentEvent';

export default class AssignmentEvent extends AssessmentEvent {
	constructor (contentId, rootContextID, assignmentId) {
		super(contentId, rootContextID, assignmentId, ASSIGNMENT_VIEWED);
	}
}
