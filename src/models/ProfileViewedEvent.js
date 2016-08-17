import ProfileEvent from './abstract/ProfileEvent';
import {PROFILE_VIEWED as mimeType} from '../MimeTypes';

export default class ProfileViewedEvent extends ProfileEvent {
	constructor (profileEntity) {
		super(mimeType, profileEntity, Date.now());
	}
}
