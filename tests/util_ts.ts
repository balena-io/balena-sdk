import * as m from 'mochainon';
import type { AnyObject } from '../typings/utils';
import { balena, BalenaSdk } from './integration/setup';
const { expect } = m.chai;

export const describeExpandAssertions = async <T>(
	params: BalenaSdk.PineParams<T>,
) => {
	describe(`expanding from ${params.resource}`, function () {
		Object.keys(params.options.$expand).forEach((key) => {
			describe(`to ${key}`, function () {
				it('should succeed and include the expanded property', async function () {
					const [result] = await balena.pine.get<AnyObject>({
						...params,
						options: {
							...params.options,
							$expand: {
								[key]: params.options.$expand[key],
							},
						},
					});
					if (result) {
						expect(result).to.have.property(key).that.is.an('array');
					}
				});
			});
		});
	});
};
