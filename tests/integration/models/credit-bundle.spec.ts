import { expect } from 'chai';
import { timeSuite } from '../../util';

import {
	balena,
	givenLoggedInUser,
	givenInitialOrganization,
	loginPaidUser,
} from '../setup';

describe.skip('Credit Bundle Model', function () {
	timeSuite(before);
	givenLoggedInUser(before);
	let hasActiveBillingAccount = false;

	const givenABillingAccountIt = (
		description: string,
		testFn: (...args: any[]) => any,
	) => {
		const $it = hasActiveBillingAccount ? it : it.skip;
		$it(description, testFn);
	};

	before(async function () {
		try {
			await loginPaidUser();
			const accountInfo = await balena.models.billing.getAccount(
				this.initialOrg.id,
			);
			hasActiveBillingAccount =
				(accountInfo != null ? accountInfo.account_state : undefined) ===
				'active';
		} catch {
			// ignore
		}
	});

	givenInitialOrganization(before);

	describe('given no credit bundles', function () {
		givenABillingAccountIt(
			'should initially be an empty array',
			async function () {
				const creditBundles = await balena.models.creditBundle.getAllByOrg(
					this.initialOrg.id,
				);
				expect(creditBundles).to.deep.equal([]);
			},
		);

		givenABillingAccountIt(
			'should successfully purchase a credit bundle',
			async function () {
				const creditBundle = await balena.models.creditBundle.create(
					this.initialOrg.id,
					3, // 'device:microservices' feature id
					100,
				);
				expect(creditBundle).to.have.property('payment_status', 'paid');
				expect(creditBundle).to.have.property('original_quantity', 100);

				const creditBundles = await balena.models.creditBundle.getAllByOrg(
					this.initialOrg.id,
				);
				expect(creditBundles).to.have.length(1);
			},
		);
	});
});
