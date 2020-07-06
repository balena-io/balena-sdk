/// <reference types="chai" />

declare module 'chai-samsam' {
	const chaiSamSam: Chai.ChaiPlugin;
	export = chaiSamSam;
}

// tslint:disable-next-line:no-namespace
declare namespace Chai {
	interface Deep {
		match: Equal;
	}
}
