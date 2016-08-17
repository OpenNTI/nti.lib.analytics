import AssessmentEvent from './AssessmentEvent';
import {ASSIGNMENT_VIEWED} from '../MimeTypes';

export default class AssignmentEvent extends AssessmentEvent {
	constructor (contentId, courseId, assignmentId) {
		super(contentId, courseId, assignmentId, ASSIGNMENT_VIEWED);
	}
}
