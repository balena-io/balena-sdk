export interface JWTUser {
	account_type?: string;
	actualUser?: number;
	company?: string;
	created_at: string;
	email?: string;
	features?: string[];
	first_name?: string;
	hasPasswordSet?: boolean;
	has_disabled_newsletter?: boolean;
	must_be_verified?: boolean;
	is_verified?: boolean;
	id: number;
	intercomUserName?: string;
	intercomUserHash?: string;
	jwt_secret: string;
	last_name?: string;
	loginAs?: boolean;
	permissions?: string[];
	twoFactorRequired?: boolean;
	username: string;

	/** @deprecated User the social_service_account resource */
	social_service_account?: SocialServiceAccount[];
}

interface SocialServiceAccount {
	provider: string;
	display_name: string;
}
