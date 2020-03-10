import * as m from 'mochainon';
import { AnyObject } from '../typings/utils';
import { balena, BalenaSdk } from './integration/setup';
const { expect } = m.chai;

export const describeExpandAssertions = async <T>(
	params: BalenaSdk.PineParams<T>,
) => {
	describe(`expanding from ${params.resource}`, function() {
		Object.keys(params.options.$expand).forEach(key => {
			describe(`to ${key}`, function() {
				it('should succeed', async function() {
					const [result] = await balena.pine.get<AnyObject>({
						...params,
						options: {
							...params.options,
							$expand: {
								[key]: params.options.$expand[key],
							},
						},
					});
					this.result = result;
				});

				it('should include the expanded property', function() {
					if (!this.result) {
						this.skip();
						return;
					}

					expect(this.result)
						.to.have.property(key)
						.that.is.an('array');
				});
			});
		});
	});
};
