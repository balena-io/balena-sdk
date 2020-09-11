declare module 'mocha.parallel' {
	import * as mocha from 'mocha';

	const parallel: typeof mocha.describe;
	export = parallel;
}
