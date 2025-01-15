export interface JWTUser {
	id: number;
	jwt_secret: string;
	authTime?: number;
	actualUser?: number;
	twoFactorRequired?: boolean;
	permissions?: string[];
}
