import throttle = require('lodash/throttle');
import * as memoizee from 'memoizee';
import * as moment from 'moment';

// Because we are using `leading: true` this never returns an undefined result.
// TODO: Remove this casting once the lodash typings get better
const now = throttle(() => moment(), 1000, {
	leading: true,
}) as () => moment.Moment;

const dateToMoment = memoizee((date: Date | string) => moment(date), {
	max: 1000,
	primitive: true,
});

export const timeSince = (input: Date | string, suffix = true) => {
	const date = dateToMoment(input);

	// We do this to avoid out-of-sync times causing this to return
	// e.g. 'in a few seconds'.
	// if the date is in the future .min will make it at maximum, the time since now
	// which results in 'a few seconds ago'.
	const time = now();
	return moment.min(time, date).from(time, !suffix);
};
