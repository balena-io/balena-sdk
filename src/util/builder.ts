import * as errors from 'balena-errors';
import type { InjectedDependenciesParam, InjectedOptionsParam } from '..';

type BalenaBuilderRequestError = errors.BalenaError & {
	body: BuilderBuildFromUrlErrorResponse;
};

interface BuilderBuildFromUrlSuccessResponse {
	started: true;
	releaseId: number;
}

interface BuilderBuildFromUrlErrorResponse {
	started: false;
	error: string;
	message: string;
}

type BuilderBuildFromUrlResponse =
	| BuilderBuildFromUrlSuccessResponse
	| BuilderBuildFromUrlErrorResponse;

const isBuilderError = (error: any): error is BalenaBuilderRequestError =>
	error.code === 'BalenaRequestError' &&
	typeof error.body === 'object' &&
	!!error.body.error;

export interface BuilderUrlDeployOptions {
	url: string;
	shouldFlatten?: boolean;
}

export class BuilderHelper {
	constructor(
		private deps: InjectedDependenciesParam,
		private opts: InjectedOptionsParam,
	) {}

	public async buildFromUrl(
		owner: string,
		appName: string,
		urlDeployOptions: BuilderUrlDeployOptions,
	) {
		try {
			const resp = await this.deps.request.send<BuilderBuildFromUrlResponse>({
				method: 'POST',
				url: `/v3/buildFromUrl?headless=true&owner=${owner}&app=${appName}`,
				baseUrl: this.opts.builderUrl,
				body: Object.assign(
					{
						shouldFlatten: urlDeployOptions.shouldFlatten ?? true,
					},
					urlDeployOptions,
				),
			});
			if (!resp.body.started) {
				throw new errors.BalenaError(resp.body.message);
			}
			return resp.body.releaseId;
		} catch (err) {
			if (isBuilderError(err)) {
				err.message = err.body.message || err.body.error;
			}
			throw err;
		}
	}
}
