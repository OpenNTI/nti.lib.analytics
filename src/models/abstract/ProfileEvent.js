import Base from './Base';
import {definePublic} from '../../utils';

//We need a truthy value, but serialize to null.
//The base class throws an exception if RootContextID is falsy. However, we need it to be for profile events.
const NULLED = { toJSON: () => null };

export default class ProfileEvent extends Base {
	constructor (mimeType, entity, startTime) {
		super(mimeType, NULLED, startTime);
		Object.defineProperties(this, {
			...definePublic({
				ProfileEntity: entity
			})
		});
	}
}
