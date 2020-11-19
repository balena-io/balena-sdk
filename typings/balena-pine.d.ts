import type * as PineClient from './pinejs-client-core';

export type Pine = PineClient.Pine;
/**
 * A variant that makes $select mandatory, helping to create
 * requests that explicitly fetch only what your code needs.
 */
export type PineStrict = PineClient.PineStrict;
