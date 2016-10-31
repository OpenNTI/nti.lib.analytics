import AssessmentEvent from './AssessmentEvent';
import {ASSIGNMENT_VIEWED} from '../MimeTypes';

export default class AssignmentEvent extends AssessmentEvent {
	constructor (contentId, rootContextID, assignmentId) {
		super(contentId, rootContextID, assignmentId, ASSIGNMENT_VIEWED);
	}
}
