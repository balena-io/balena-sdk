import * as ResinSdk from '../../typings/resin-sdk';

/** Use with: `findCallback(arguments)`. */
export function findCallback(args: IArguments): (() => void);

/**
 * Merging two sets of pine options sensibly is more complicated than it sounds.
 *
 * The general rules are:
 * * select, orderby, top and skip override (select this, instead of the default)
 * * filters are combined (i.e. both filters must match)
 * * expands are combined (include both expansions), and this recurses down.
 *   * That means $expands within expands are combined
 *   * And $selects within expands override
 * * Any unknown 'extra' options throw an error. Unknown 'default' options are ignored.
 */
export function mergePineOptions<T = ResinSdk.PineOptions>(
	defaults: T,
	extras: T,
): T;
