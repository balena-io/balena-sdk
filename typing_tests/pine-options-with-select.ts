/// <reference types="node" />
import type * as BalenaSdk from '..';

// This file is in .prettierignore, since otherwise
// the @ts-expect-error comments would move to the wrong place

// @ts-expect-error
export const noTopSelect: BalenaSdk.PineOptionsStrict<BalenaSdk.Application> = {
	$expand: {
		owns__device: {
			$select: 'id',
		},
	},
	$filter: {
		id: 5,
	},
};

// @ts-expect-error
export const noTopSelect2: BalenaSdk.PineOptionsStrict<BalenaSdk.Application> =
	{
		$filter: {
			id: 5,
		},
	};

export const noTopSelectFixed: BalenaSdk.PineOptionsStrict<BalenaSdk.Application> =
	{
		$select: 'id',
		$filter: {
			id: 5,
		},
	};

export const propExpand: BalenaSdk.PineOptionsStrict<BalenaSdk.Application> = {
	$select: 'id',
	// @ts-expect-error
	$expand: 'owns__device',
	$filter: {
		id: 5,
	},
};

export const propExpandArray: BalenaSdk.PineOptionsStrict<BalenaSdk.Application> =
	{
		$select: 'id',
		// @ts-expect-error
		$expand: ['owns__device'],
		$filter: {
			id: 5,
		},
	};

export const expandWithNoSelect: BalenaSdk.PineOptionsStrict<BalenaSdk.Application> =
	{
		$select: 'id',
		// @ts-expect-error
		$expand: {
			owns__device: {},
		},
		$filter: {
			id: 5,
		},
	};

export const expandWithNoSelect2: BalenaSdk.PineOptionsStrict<BalenaSdk.Application> =
	{
		$select: 'id',
		// @ts-expect-error
		$expand: {
			owns__device: {
				$filter: {
					id: 5,
				},
			},
		},
		$filter: {
			id: 5,
		},
	};

export const expandWithNoSelectFixed: BalenaSdk.PineOptionsStrict<BalenaSdk.Application> =
	{
		$select: 'id',
		$expand: {
			owns__device: {
				$select: 'id',
			},
		},
		$filter: {
			id: 5,
		},
	};

export const nestedExpandWithNoSelect3: BalenaSdk.PineOptionsStrict<BalenaSdk.Application> =
	{
		$select: 'id',
		// @ts-expect-error
		$expand: {
			owns__device: {
				$expand: {
					device_environment_variable: {
						$select: ['name', 'value'],
					},
				},
			},
		},
	};

export const nestedExpandWithNoSelect4: BalenaSdk.PineOptionsStrict<BalenaSdk.Application> =
	{
		$select: 'id',
		// @ts-expect-error
		$expand: {
			owns__device: {
				$select: 'id',
				$expand: {
					device_environment_variable: {},
				},
			},
		},
	};

export const nestedExpandWithNoSelectFixed: BalenaSdk.PineOptionsStrict<BalenaSdk.Application> =
	{
		$select: 'id',
		$expand: {
			owns__device: {
				$select: 'id',
				$expand: {
					device_environment_variable: {
						$select: ['name', 'value'],
					},
				},
				$filter: {
					id: 5,
				},
			},
		},
		$filter: {
			id: 5,
		},
	};
