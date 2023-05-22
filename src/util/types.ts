import type { Writable } from '../../typings/utils';

export const toWritable = <T extends Readonly<any>>(obj: T) =>
	obj as Writable<T>;
