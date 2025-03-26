import memoizee from 'memoizee';
import type { PubSub } from './pubsub';
const DEFAULT_CACHING_INTERVAL = 10 * 60 * 1000; // 10 minutes

export const getAuthDependentMemoize = (
	pubsub: PubSub,
	cacheInterval = DEFAULT_CACHING_INTERVAL,
) => {
	return <T extends (...args: any[]) => any>(fn: T) => {
		const memoizedFn = memoizee(fn, {
			maxAge: cacheInterval,
			primitive: true,
			promise: true,
		});

		pubsub.subscribe('auth.keyChange', () => {
			memoizedFn.clear();
		});

		return memoizedFn;
	};
};
