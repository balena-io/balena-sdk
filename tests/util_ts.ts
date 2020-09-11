import * as m from 'mochainon';
import * as parallel from 'mocha.parallel';
import { balena } from './integration/setup';
import type * as BalenaSdk from '..';
const { expect } = m.chai;

export const describeExpandAssertions = async <T>(
	params: BalenaSdk.PineParams<T>,
) => {
	const expand = params.options?.$expand;
	if (expand == null) {
		throw new Error(
			`Params object passed to 'describeExpandAssertions' must include a $expand`,
		);
	}
	parallel(`expanding from ${params.resource}`, function () {
		Object.keys(expand).forEach((key) => {
			it(`should succeed to expand property ${key}`, async function () {
				const [result] = await balena.pine.get<T>({
					...params,
					options: {
						...params.options,
						$expand: {
							[key]: expand[key],
						},
					},
				} as typeof params);
				if (result) {
					expect(result).to.have.property(key).that.is.an('array');
				}
			});
		});
	});
};
