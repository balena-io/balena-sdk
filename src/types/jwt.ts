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
	/** @deprecated Use the actualUser field */
	loginAs?: boolean;
	/** @deprecated */
	features?: string[];

	/** @deprecated Use the user_profile resource */
	first_name?: string;
	/** @deprecated Use the user_profile resource */
	last_name?: string;
	/** @deprecated Use the user_profile resource */
	email?: string;
	/** @deprecated Use the user_profile resource */
	account_type?: string;
	/** @deprecated Use the user_profile resource */
	company?: string;
	/** @deprecated Use the user_profile resource */
	has_disabled_newsletter?: boolean;
	/** @deprecated Use the user_profile resource */
	hasPasswordSet?: boolean;
	/** @deprecated Use the user_profile resource */
	must_be_verified?: boolean;
	/** @deprecated Use the user_profile resource */
	is_verified?: boolean;

	/** @deprecated */
	intercomUserName?: string;
	/** @deprecated */
	intercomUserHash?: string;

	/** @deprecated Use the social_service_account resource */
	social_service_account?: SocialServiceAccount[];
}

interface SocialServiceAccount {
	provider: string;
	display_name: string;
}
