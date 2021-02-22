import { register } from '../Registry';

import AssessmentView from './AssessmentView';

class AssignmentView extends AssessmentView {
	static EventType =
		'application/vnd.nextthought.analytics.assignmentviewevent';
}

export default register('AssignmentView', AssignmentView);
