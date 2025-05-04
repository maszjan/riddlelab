export interface User {
	id: number;
	name: string;
	email: string;
	email_verified_at?: string;
	last_login_at?: string;
	role: string;
	avatar_url?: string;
	player_configuration: {
		avatar: {
			skin_color: string;
			hair_color: string;
			eye_color: string;
			outfit_color: string;
		};
	};
	created_at?: string;
	updated_at?: string;
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

export interface RiddleFormState {
	id: string | null;
	title: string;
	type: string;
	question: string;
	answer: string;
	hints: string[];
	isEditing: boolean;
}

export interface Asset {
	id: number;
	name: string;
	type: string;
	image_url: string;
	has_collider: boolean;
	owner_id: number | null;
	is_public: boolean;
	created_at: string;
	updated_at: string;
}

export interface AssetsResponse {
	door: Asset[];
	floor: Asset[];
	prop: Asset[];
	riddle: Asset[];
}

export interface Asset {
	id: number;
	name: string;
	type: string;
	image_url: string;
	has_collider: boolean;
	owner_id: number | null;
	is_public: boolean;
	created_at: string;
	updated_at: string;
}

export interface AssetResponse {
	asset: Asset;
	image: string;
}
