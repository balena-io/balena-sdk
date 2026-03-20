import * as balenaErrors from 'balena-errors';

export class ReleaseAssetAlreadyExists extends balenaErrors.BalenaError {
	constructor(release: number, asset_key: string) {
		super(
			new Error(
				`Release asset combination of ${release} and ${asset_key} already exists`,
			),
		);
	}
}

export class OSImageNotFound extends balenaErrors.BalenaError {
	constructor(deviceType: string, version: string, imageType?: string) {
		if (!imageType) {
			super(
				new Error(
					`No image found for device type ${deviceType} and version ${version}`,
				),
			);
		} else {
			super(
				new Error(
					`No image found for device type ${deviceType}, version ${version}, and image type ${imageType}`,
				),
			);
		}
	}
}

export * from 'balena-errors';
