export interface User {
	id: string;
	username: string;
	email: string;
}


export interface Token {
	accessToken: string;
	expiresIn: number; 
}


export interface UserState {
	user: User | null;
	token: string | null;
}


export interface SetUserPayload {
	id: string;
	username: string;
	email: string;
}

export interface SetTokenPayload {
	accessToken: string;
	expiresIn: number;
}
