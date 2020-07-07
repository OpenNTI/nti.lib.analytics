import {register} from '../Registry';

import AssessmentView from './AssessmentView';

class SurveyView extends AssessmentView {
	static EventType = 'application/vnd.nextthought.analytics.surveyviewevent'
}

export default register('SurveyView', SurveyView);
