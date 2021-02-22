/* eslint-env jest */
export const BEGIN_SESSION = '/analytics_session';
export const END_SESSION = '/end_analytics_session';
export const BATCH_EVENT = '/batch_events';

export const mockService = (disabled, hasCookie, noConnection, rejectPost) => {
	const service = {
		getWorkspace: () => {
			return disabled
				? null
				: {
						Links: [
							{
								rel: 'analytics_session',
								href: BEGIN_SESSION,
							},
							{
								rel: 'end_analytics_session',
								href: END_SESSION,
							},
							{
								rel: 'batch_events',
								href: BATCH_EVENT,
							},
						],
						getLink(rel) {
							return (this.Links.find(x => x.rel === rel) || {})
								.href;
						},
				  };
		},
		hasCookie: () => hasCookie,
		post: () =>
			noConnection
				? Promise.reject({ statusCode: 0 })
				: rejectPost
				? Promise.reject({ statusCode: 422 })
				: Promise.resolve({ statusCode: 200 }),
	};

	jest.spyOn(service, 'post');

	return service;
};
