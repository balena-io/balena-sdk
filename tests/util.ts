import 'chai-samsam';
import { expect } from 'chai';
import parallel from 'mocha.parallel';
import { balena } from './integration/setup';
import type { Params } from 'pinejs-client-core';
import type { BalenaModel } from '../es2017';

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

export const describeExpandAssertions = <
	T extends BalenaModel[keyof BalenaModel],
>(
	params: Params<T>,
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
				// @ts-expect-error - this typing is actually incomplete
				// runtime errors will happen if params has an id or options has $count
				const [result] = await balena.pine.get({
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
				} as Omit<Params<T>, 'resource'> & { resource: keyof BalenaModel });

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
	let timerId: ReturnType<typeof setTimeout> | undefined;
	try {
		await new Promise((resolve) => {
			timerId = setTimeout(resolve, ms);
		});
	} finally {
		if (timerId != null) {
			clearTimeout(timerId);
		}
	}
}

// Wait for a condition to be true, throw if it doesn't happen in time
export async function waitFor(
	checkFn: () => boolean | Promise<boolean>,
	options?: {
		timeout?: number;
		maxCount?: number;
	},
): Promise<void> {
	const timeout = options?.timeout ?? 2000;
	const maxCount = options?.maxCount ?? 10;
	for (let i = 1; i <= maxCount; i++) {
		console.log(`Waiting (${i}/${maxCount})...`);
		await delay(timeout);
		if (await checkFn()) {
			return;
		}
	}
	throw new Error('waitFor timed out');
}
