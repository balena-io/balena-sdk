export type AnyObject = {
	[index: string]: any;
};

export type PropsOfType<T, P> = {
	[K in keyof T]: T[K] extends P ? K : never
}[keyof T];

// backwards compatible alternative for: Extract<keyof T, string>
export type StringKeyof<T> = keyof T & string;

// Functionally the same as Exclude, but for strings only.
type Diff<T extends string, U extends string> = ({ [P in T]: P } &
	{ [P in U]: never } & { [x: string]: never })[T];

export type Omit<T, K extends keyof T & string> = Pick<
	T,
	Diff<keyof T & string, K>
>;
