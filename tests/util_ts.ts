import * as m from 'mochainon';
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
	describe(`expanding from ${params.resource}`, function () {
		Object.keys(expand).forEach((key) => {
			describe(`to ${key}`, function () {
				it('should succeed and include the expanded property', async function () {
					const [result] = await balena.pine.get({
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
	});
};
