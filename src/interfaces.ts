/* eslint-disable @typescript-eslint/no-explicit-any */
export interface User {
	id: number;
	name: string;
	email: string;
	email_verified_at?: string | null;
	last_login_at?: string | null;
	role: string;
	avatar_url?: string | null;
	player_configuration:
		| string
		| {
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
	isAuthenticated: boolean;
	loading: boolean;
	error: string | null;
}

export type SetUserPayload = User;

export interface SetTokenPayload {
	accessToken: string;
	expiresIn: number;
}

export type RiddleType = "knowledge" | "riddle" | "puzzle" | "math";

export interface RiddleFormState {
	id: string | null;
	title: string;
	type: RiddleType;
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

export interface AssetData {
	asset_count: number;
	asset_limit: number;
	is_unlimited: boolean;
	asset_percentage: number;
}

export interface AssetLimit {
	used: number;
	total: number;
	asset_count: number;
	asset_limit: number;
}

export interface AssetResponse {
	id: number;
	name: string;
	url: string;
	type: string;
	userId: number;
	createdAt: string;
	updatedAt: string;
}

export interface PropFile {
	file: File | null;
	preview: string | null;
}

export interface Prop {
	id: string;
	name: string;
	imageUrl?: string;
	assetId: number | null;
	position: { row: number; col: number };
	rotation: number;
	flipHorizontal?: boolean;
	flipVertical?: boolean;
}

export interface Riddle {
	id: string;
	position: { row: number; col: number };
	type: RiddleType;
	title: string;
	question: string;
	answer: string;
	hints: string[];
	options: any;
	data?: {
		title?: string;
		question?: string;
		answer?: string;
		hints?: string[];
		options?: any;
	};
	assetId: number | null;
	texture: string | null;
}

export interface Room {
	id: string;
	name?: string;
	grid: (string | null)[][];
	door: {
		row: number;
		col: number;
		rotation: number;
		scaleX?: number;
		scaleY?: number;
		opacity?: number;
	};
	riddles: Riddle[];
	props: Prop[];
	walls: { row: number; col: number }[];
	wallThickness: number;
	floorTexture: string | null;
	floorTextureAssetId: number | null;
	doorTexture: string | null;
	doorTextureAssetId: number | null;
	floorColor?: string;
}

export interface Metadata {
	title: string;
	description: string;
	difficulty: number;
	timeLimit: number;
	maxPlayers: number;
	floorColor?: string;
}

export interface EscapeRoom {
	id: string;
	rooms: Room[];
	metadata: Metadata;
	currentRoomIndex: number;
}

export interface ConfirmationModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	title: string;
	message: string;
	subMessage?: string;
	confirmText?: string;
	cancelText?: string;
	confirmButtonClass?: string;
}


export interface GameHistoryRiddle {
	riddle_id: number;
	question: string | null;
	solved: boolean;
	time_to_solve: number | null;
	attempt_number: number;
	max_attempts: number;
}

export interface GameHistoryEscapeRoom {
	id: number;
	name: string | null;
	description: string | null;
	thumbnail_url: string | null; 
}

export interface GameHistoryAttempt {
	attempt_id: number;
	escape_room: GameHistoryEscapeRoom;
	start_time: string; 
	end_time: string;
	completed: boolean;
	time_spent: number; 
	hints_used: number;
	score: number;
	status: "completed" | "active" | "paused" | string;
	riddles: GameHistoryRiddle[];
}

export interface GameHistoryResponse {
	data: GameHistoryAttempt[];
	current_page: number;
	last_page: number;
	total: number;
}
