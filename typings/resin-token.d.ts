/* tslint:disable:no-namespace */
declare namespace ResinToken {
	type ResinTokenType = string;

	interface ResinToken {
		get: () => Promise<ResinTokenType>;
	}
}

declare function ResinToken(options: object): ResinToken.ResinToken;

export = ResinToken;
