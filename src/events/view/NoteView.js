import Timed from '../abstract/Timed';
import {register} from '../Registry';

class NoteView extends Timed {
	static EventType = 'application/vnd.nextthought.analytics.noteviewevent'

	getData () {
		const data = super.getData();

		return {
			...data,
			'note_id': this.resourceId
		};
	}
}

export default register('NoteView', NoteView);
