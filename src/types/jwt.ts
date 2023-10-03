export interface JWTUser {
	id: number;
	jwt_secret: string;
	authTime?: number;
	actualUser?: number;
	twoFactorRequired?: boolean;
	permissions?: string[];

	/** @deprecated Use the user resource */
	created_at?: string;
	/** @deprecated Use the user resource */
	username?: string;
	loginAs?: boolean;
	features?: string[];

	first_name?: string;
	last_name?: string;
	email?: string;
	account_type?: string;
	company?: string;
	has_disabled_newsletter?: boolean;
	hasPasswordSet?: boolean;
	must_be_verified?: boolean;
	is_verified?: boolean;
	intercomUserName?: string;
	intercomUserHash?: string;

	/** @deprecated Use the social_service_account resource */
	social_service_account?: SocialServiceAccount[];
}

interface SocialServiceAccount {
	provider: string;
	display_name: string;
}
