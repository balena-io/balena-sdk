declare module 'mocha.parallel' {
	import type * as mocha from 'mocha';

	const parallel: typeof mocha.describe;
	export = parallel;
}
