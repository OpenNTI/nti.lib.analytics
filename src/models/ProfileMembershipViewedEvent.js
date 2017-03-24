import {PROFILE_MEMBERSHIP_VIEWED as mimeType} from '../MimeTypes';

import ProfileEvent from './abstract/ProfileEvent';

export default class ProfileViewedEvent extends ProfileEvent {
	constructor (profileEntity) {
		super(mimeType, profileEntity, Date.now());
	}
}
