export interface UserKeyWhoAmIResponse {
	id: number;
	actorType: 'user';
	actorTypeId: number;
	username: string;
	email: string | null;
}

export interface ApplicationKeyWhoAmIResponse {
	id: number;
	actorType: 'application';
	actorTypeId: number;
	slug: string;
}

export interface DeviceKeyWhoAmIResponse {
	id: number;
	actorType: 'device';
	actorTypeId: number;
	uuid: string;
}

export type WhoamiResult =
	| UserKeyWhoAmIResponse
	| ApplicationKeyWhoAmIResponse
	| DeviceKeyWhoAmIResponse;

export interface UserInfo {
	id: number;
	username: string;
	email: string | null;
}
