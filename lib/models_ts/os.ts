import * as bSemver from 'balena-semver';
import reject = require('lodash/reject');
import * as semver from 'semver';
import * as BalenaRequest from '../../typings/balena-request';
import { EsrVersions, OsVersionSet } from '../../typings/balena-sdk';
import { isDevelopmentVersion } from '../util';

interface ImagesResponse {
	versions: OsVersionSet['versions'];
	latest: OsVersionSet['latest'];
	esr?: EsrVersions;
}

const getEsrLine = (esr: EsrVersions, line: keyof EsrVersions) => {
	if (!esr[line]) {
		return;
	}

	return {
		latest: esr[line].latest,
		// recommended and default are always the latest release for each line
		recommended: esr[line].latest,
		default: esr[line].latest,
		versions: esr[line].versions.sort(bSemver.compare),
	};
};

export const _getOsVersions = (
	deviceType: string,
	{ request, apiUrl }: { request: BalenaRequest.BalenaRequest; apiUrl: string },
) => {
	return request
		.send({
			method: 'GET',
			url: `/device-types/v1/${deviceType}/images`,
			baseUrl: apiUrl,
			// optionaly authenticated, so we send the token in all cases
		})
		.get('body')
		.then(({ versions, latest, esr }: ImagesResponse) => {
			versions.sort(bSemver.rcompare);
			const potentialRecommendedVersions = reject(
				versions,
				version => semver.prerelease(version) || isDevelopmentVersion(version),
			);
			const recommended = potentialRecommendedVersions
				? potentialRecommendedVersions[0]
				: null;

			let esrResult = {};

			if (esr) {
				esrResult = {
					esr: {
						next: getEsrLine(esr, 'next'),
						current: getEsrLine(esr, 'current'),
						sunset: getEsrLine(esr, 'sunset'),
					},
				};
			}

			return {
				versions,
				recommended,
				latest,
				default: recommended || latest,
				...esrResult,
			};
		});
};
