import formatDistance from 'date-fns/formatDistance';
import memoizee from 'memoizee';

const now = memoizee(() => new Date(), { maxAge: 1000 });

const dateToMoment = memoizee((date: Date | string) => new Date(date), {
	max: 1000,
	primitive: true,
});

export const timeSince = (input: Date | string, suffix = true) => {
	const date = dateToMoment(input);

	// We do this to avoid out-of-sync times causing this to return
	// e.g. 'in a few seconds'.
	// if the date is in the future, make it at maximum the time since now
	// which results in 'a few seconds ago'.
	const $now = now();
	return formatDistance($now < date ? $now : date, $now, { addSuffix: suffix });
};
