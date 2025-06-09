import type { Resource } from 'pinejs-client-core';
import type BalenaModel from './v7';
import type { Application, Device } from './v7';

export type * from './v7';
export { BalenaModel };

export interface EnvironmentVariableBase {
	id: number;
	name: string;
	value: string;
}
export interface DeviceVariable extends EnvironmentVariableBase {
	device: NavigationResource<Device['Read']>;
}

export interface ApplicationVariable extends EnvironmentVariableBase {
	application: NavigationResource<Application['Read']>;
}

export interface PineDeferred {
	__id: number;
}

export type NavigationResource<T extends Resource['Read']> = [T] | PineDeferred;

export type OptionalNavigationResource<T extends Resource['Read']> =
	| []
	| [T]
	| PineDeferred
	| null;
