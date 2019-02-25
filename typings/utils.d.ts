// Functionally the same as Exclude, but for strings only.
type Diff<T extends string, U extends string> = ({ [P in T]: P } &
	{ [P in U]: never } & { [x: string]: never })[T];

export type Omit<T, K extends keyof T & string> = Pick<
	T,
	Diff<keyof T & string, K>
>;
