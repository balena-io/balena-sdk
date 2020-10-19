export interface AnyObject {
	[index: string]: any;
}

export type PropsOfType<T, P> = {
	[K in keyof T]: T[K] extends P ? K : never;
}[keyof T];

// backwards compatible alternative for: Extract<keyof T, string>
export type StringKeyof<T> = keyof T & string;

export interface Dictionary<T> {
	[key: string]: T;
}

export type Resolvable<R> = R | PromiseLike<R>;

export type AtLeast<T, K extends keyof T> = Pick<T, K> & Partial<Omit<T, K>>;

export type Writable<T> = { -readonly [K in keyof T]: T[K] };

// TODO: Change this approximation once TS properly supports Exact Types for generics.
// See: https://github.com/microsoft/TypeScript/issues/12936#issuecomment-711172739
export type ExactlyExtends<T, ExtendsBase> = ExtendsBase extends T
	? T
	: ExtendsBase;

// TODO: Replace this workaround once TS adds support for this use case.
// See: https://github.com/microsoft/TypeScript/issues/14829#issuecomment-322267089
// See: https://github.com/millsp/ts-toolbelt/blob/3859d1819021800b96ed815abf5c300eb7b8f926/src/Function/NoInfer.ts#L27
export type NoInfer<A extends any> = [A][A extends any ? 0 : never];
