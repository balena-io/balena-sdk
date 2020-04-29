import * as m from 'mochainon';
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
