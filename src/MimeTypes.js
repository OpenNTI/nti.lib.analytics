export const ASSIGNMENT_VIEWED = 'application/vnd.nextthought.analytics.assignmentviewevent';
export const PROFILE_VIEWED = 'application/vnd.nextthought.analytics.profileviewevent';
export const PROFILE_ACTIVITY_VIEWED = 'application/vnd.nextthought.analytics.profileactivityviewevent';
export const PROFILE_MEMBERSHIP_VIEWED = 'application/vnd.nextthought.analytics.profilemembershipviewevent';
export const RESOURCE_VIEWED = 'application/vnd.nextthought.analytics.resourceevent';
export const SELFASSESSMENT_VIEWED = 'application/vnd.nextthought.analytics.selfassessmentviewevent';
export const TOPIC_VIEWED = 'application/vnd.nextthought.analytics.topicviewevent';
export const WATCH_VIDEO = 'application/vnd.nextthought.analytics.watchvideoevent';
export const UNKNOWN_TYPE = 'application/vnd.nextthought.analytics.unknowntype';

const TYPES = {
	ASSIGNMENT_VIEWED,
	PROFILE_VIEWED,
	PROFILE_ACTIVITY_VIEWED,
	PROFILE_MEMBERSHIP_VIEWED,
	RESOURCE_VIEWED,
	SELFASSESSMENT_VIEWED,
	TOPIC_VIEWED,
	WATCH_VIDEO
};


export function isKnown (type) {
	const KNOWN = getTypes();
	return !!KNOWN[type];
}


export function getTypes () {
	const types = getTypes.cache || {};
	if (!getTypes.cache) {
		getTypes.cache = types;

		Object.keys(TYPES).forEach(key => {
			let mt = TYPES[key];
			if (typeof mt === 'string') {
				types[mt] = mt;
			}
		});
	}
	return types;
}
