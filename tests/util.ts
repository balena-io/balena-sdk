import 'chai-samsam';
import * as m from 'mochainon';
import * as parallel from 'mocha.parallel';
import { balena } from './integration/setup';
import type * as BalenaSdk from '..';
const { expect } = m.chai;

export const assertDeepMatchAndLength = (a: any, b: any) => {
	[a, b].forEach((target) =>
		expect(target).to.have.property('length').that.is.a('number'),
	);

	if (a.length !== b.length) {
		// We found an error! Use deep.equal
		// so that the whole content of array a is printed.
		expect(a).to.deep.equal(b);
	}

	expect(a).to.deep.match(b);
	expect(a).to.have.lengthOf(b.length);
};

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
