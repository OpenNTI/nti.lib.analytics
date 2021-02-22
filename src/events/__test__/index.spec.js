/* eslint-env jest */
import '../index';
import { Registry } from '../Registry';

const KNOWN = [
	'AssessmentView',
	'AssignmentView',
	'CourseCatalogView',
	'NoteView',
	'ProfileAboutView',
	'ProfileActivityView',
	'ProfileMembershipView',
	'ResourceView',
	'SurveyView',
	'ThoughtView',
	'TopicView',
	'VideoSkip',
	'VideoWatch',
	'VideoSpeedChange',
];

test('Validate events are resolvable', () => {
	const registry = Registry.getInstance();

	for (let type of KNOWN) {
		const a = registry.getEventFor(type);

		expect(a).toBeTruthy();
	}
});
