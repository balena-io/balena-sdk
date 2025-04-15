import 'chai-samsam';
import { expect } from 'chai';
import parallel from 'mocha.parallel';
import { balena } from './integration/setup';
import type * as BalenaSdk from '..';

export function assertExists(v: unknown): asserts v is NonNullable<typeof v> {
	expect(v).to.exist;
}

function assertError(err: unknown): asserts err is Error {
	expect(err, 'err was not an Error').to.be.an.instanceof(Error);
}

export async function expectError(
	fn: () => Promise<void> | void,
	extraErrorChecks?: string | RegExp | ((error: Error) => void),
) {
	let err: unknown;
	let resolved = false;
	try {
		await fn();
		resolved = true;
	} catch ($err) {
		err = $err;
	}
	expect(resolved).to.equal(
		false,
		'The function completed w/o error, while expecting one',
	);
	assertError(err);
	if (typeof extraErrorChecks === 'function') {
		extraErrorChecks(err);
	} else if (typeof extraErrorChecks === 'string') {
		expect(err).to.have.property('message').that.includes(extraErrorChecks);
	} else if (extraErrorChecks != null && extraErrorChecks instanceof RegExp) {
		expect(err).to.have.property('message').that.matches(extraErrorChecks);
	}
}

export const assertDeepMatchAndLength = (a: unknown[], b: unknown[]) => {
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

export const describeExpandAssertions = <T extends object>(
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
						$select: 'id',
						...params.options,
						$expand: {
							[key]: {
								$select: 'id',
								...expand[key],
							},
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

export const timeSuite = function (beforeFn: Mocha.HookFunction) {
	let start: number;

	beforeFn(function () {
		start = Date.now();
	});

	const afterFn = beforeFn === beforeEach ? afterEach : after;
	afterFn(function () {
		console.log(
			`Finished ${this.test?.parent?.title} test suite in ${
				(Date.now() - start) / 1000
			} seconds.`,
		);
	});
};

export async function delay(ms: number) {
	await new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}
