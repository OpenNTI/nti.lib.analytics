import {Registry} from './Registry';

import './view/AssessmentView';
import './view/AssignmentView';
import './view/CourseCatalogView';
import './view/NoteView';
import './view/ProfileAboutView';
import './view/ProfileActivityView';
import './view/ProfileMembershipView';
import './view/ResourceView';
import './view/SurveyView';
import './view/ThoughtView';
import './view/TopicView';

import './video/VideoSkip';
import './video/VideoWatch';
import './video/VideoSpeedChange';


export function getEventsForManager (manager) {
	return Registry.getEventsForManager(manager);
}
