import {
	ASSIGNMENT_VIEWED,
	PROFILE_VIEWED,
	PROFILE_ACTIVITY_VIEWED,
	PROFILE_MEMBERSHIP_VIEWED,
	RESOURCE_VIEWED,
	SELFASSESSMENT_VIEWED,
	TOPIC_VIEWED,
	WATCH_VIDEO,
} from '../MimeTypes';

import AssessmentEvent from './AssessmentEvent';
import AssignmentEvent from './AssignmentEvent';
import ResourceEvent from './ResourceEvent';
import ExternalResourceEvent from './ExternalResourceEvent';
import ProfileViewedEvent from './ProfileViewedEvent';
import ProfileActivityViewedEvent from './ProfileActivityViewedEvent';
import ProfileMembershipViewedEvent from './ProfileMembershipViewedEvent';
import TopicViewedEvent from './TopicViewedEvent';
import WatchVideoEvent from './WatchVideoEvent';

const MAPPING = {
	[SELFASSESSMENT_VIEWED]: AssessmentEvent,
	[ASSIGNMENT_VIEWED]: AssignmentEvent,
	[RESOURCE_VIEWED]: ResourceEvent,
	[TOPIC_VIEWED]: TopicViewedEvent,
	[PROFILE_VIEWED]: ProfileViewedEvent,
	[PROFILE_ACTIVITY_VIEWED]: ProfileActivityViewedEvent,
	[PROFILE_MEMBERSHIP_VIEWED]: ProfileMembershipViewedEvent,
	[WATCH_VIDEO]: WatchVideoEvent
};

export function getModel (type) {
	return MAPPING[type] || MAPPING[`application/vnd.nextthought.${type}`];
}


export {
	AssessmentEvent,
	AssignmentEvent,
	ResourceEvent,
	ExternalResourceEvent,
	ProfileViewedEvent,
	ProfileActivityViewedEvent,
	ProfileMembershipViewedEvent,
	TopicViewedEvent,
	WatchVideoEvent
};
