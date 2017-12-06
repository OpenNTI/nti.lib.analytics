import {register} from '../Registry';

import AssessmentView from './AssessmentView';

@register('SurveyView')
export default class SurveyView extends AssessmentView {
	// static EventType = 'application/vnd.nextthought.analytics.surveyviewevent'
}
