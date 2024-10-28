export interface AnyObject {
	[index: string]: any;
}

export type PropsOfType<T, P> = {
	[K in keyof T]-?: T[K] extends P ? K : never;
}[keyof T];

export type PropsAssignableWithType<T, P> = {
	[K in keyof T]-?: P extends T[K] ? K : never;
}[keyof T];

// backwards compatible alternative for: Extract<keyof T, string>
export type StringKeyof<T> = keyof T & string;

export interface Dictionary<T> {
	[key: string]: T;
}

export type TypeOrDictionary<T> =
	| T
	| {
			[key: string]: T;
	  };

export type IfDefined<T, P> = undefined extends T ? object : P;

export type Resolvable<R> = R | PromiseLike<R>;

export type ResolvableReturnType<T extends (...args: any[]) => any> =
	T extends (...args: any[]) => Resolvable<infer R> ? R : any;

export type AtLeast<T, K extends keyof T> = Pick<T, K> & Partial<Omit<T, K>>;

// TODO: Change this approximation once TS properly supports Exact Types for generics.
// See: https://github.com/microsoft/TypeScript/issues/12936#issuecomment-711172739
export type ExactlyExtends<T, ExtendsBase> = ExtendsBase extends T
	? T
	: ExtendsBase;
