export type AnyObject = {
	[index: string]: any;
};

export type PropsOfType<T, P> = {
	[K in keyof T]: T[K] extends P ? K : never
}[keyof T];

// backwards compatible alternative for: Extract<keyof T, string>
export type StringKeyof<T> = keyof T & string;

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
