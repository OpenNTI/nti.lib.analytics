/* eslint-env jest */

const BEGIN_SESSION = '/analytic-session';
const END_SESSION = '/end-analytic-session';
const BATCH_EVENTS = '/batch-events';

function mockService (hasCookie, noConnection) {

	const service = {
		getWorkspace: () => {
			return {
				Links: [
					{
						rel: 'analytics_session',
						href: BEGIN_SESSION
					},
					{
						rel: 'end_analytics_session',
						href: END_SESSION
					},
					{
						rel: 'batch_events',
						href: BATCH_EVENTS
					}
				],
			};
		},
		hasCookie: () => hasCookie,
		post: () => noConnection ? Promise.reject({statusCode: 0}) : Promise.resolve()
	}

	jest.spyOn(service, 'getWorkspace');
	jest.spyOn(service, 'hasCookie');
	jest.spyOn(service, 'post');
}

describe('Analytic Messages Test', () => {
	test('')
});
