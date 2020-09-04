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
