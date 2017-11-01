import {Registry} from './Registry';


export AssessmentView from './view/AssessmentView';
export AssignmentView from './view/AssignmentView';
export CourseCatalogView from './view/CourseCatalogView';
export NoteView from './view/NoteView';
export ProfileAboutView from './view/ProfileAboutView';
export ProfileActivityView from './view/ProfileActivityView';
export ProfileMembershipView from './view/ProfileMembershipView';
export ResourceView from './view/ResourceView';
export ThoughtView from './view/ThoughtView';
export TopicView from './view/TopicView';

export function getEventsForManager (manager) {
	return Registry.getEventsForManager(manager);
}
