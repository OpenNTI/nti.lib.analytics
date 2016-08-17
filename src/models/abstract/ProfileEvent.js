import Base from './Base';
import {definePublic} from '../../utils';

export default class ProfileEvent extends Base {
	constructor (mimeType, entity, startTime) {
		super(mimeType, null, null, startTime);
		Object.defineProperties(this, {
			...definePublic({
				ProfileEntity: entity
			})
		});
	}
}
