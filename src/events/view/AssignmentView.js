import {register} from '../Registry';

import AssessmentView from './AssessmentView';

@register('AssignmentView')
export default class AssignmentView extends AssessmentView {
	static EventType = 'application/vnd.nextthought.analytics.assignmentviewevent'
}
