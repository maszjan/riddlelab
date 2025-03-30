/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Asset {
	id: string;
	name: string;
	type: "image" | "audio" | "video";
	url: string;
}

interface Metadata {
	name: string;
	description: string;
	thumbnail: string | null;
}

interface Riddle {
	id: string;
	position: { row: number; col: number } | null;
	type: string;
	data: any;
}

interface Room {
	id: string;
	escapeRoomId: string;
	grid: { [key: string]: boolean };
	walls: { [key: string]: string };
	floorColor: string;
	wallColor: string;
	wallThickness: number;
	floorTexture: string | null;
	door: { row: number; col: number } | null;
	doorTexture: string | null;
	startingPoint: { row: number; col: number } | null;
	riddles: Riddle[];
	floorAccepted: boolean;
}

interface EscapeRoom {
	id: string;
	name: string;
	description: string;
	thumbnail: string | null;
	assets: Asset[];
	metadata: Metadata;
	rooms: Room[];
}

interface EditorState {
	currentEscapeRoomId: string;
	escapeRooms: EscapeRoom[];
	currentRoomId: string;
	selectedTool:
		| "paintFloor"
		| "eraseFloor"
		| "door"
		| "startPoint"
		| "riddle"
		| "assets"
		| "walls"
		| "clearRoom";
}

const initialState: EditorState = {
	currentEscapeRoomId: "escapeRoom1",
	escapeRooms: [
		{
			id: "escapeRoom1",
			name: "Escape Room 1",
			description: "An exciting escape room adventure.",
			assets: [],
			metadata: {
				name: "Escape Room 1",
				description: "An exciting escape room adventure.",
				thumbnail: null,
			},
			rooms: [
				{
					id: "room1",
					escapeRoomId: "escapeRoom1",
					grid: {},
					walls: {},
					floorColor: "#cccccc",
					wallColor: "#888888",
					wallThickness: 6,
					floorTexture: null,
					door: null,
					startingPoint: null,
					riddles: [],
					floorAccepted: false,
				},
			],
		},
	],
	currentRoomId: "room1",
	selectedTool: "paintFloor",
};

const editorSlice = createSlice({
	name: "editor",
	initialState,
	reducers: {
		setCurrentEscapeRoom(state, action: PayloadAction<string>) {
			state.currentEscapeRoomId = action.payload;
		},
		setCurrentRoom(state, action: PayloadAction<string>) {
			state.currentRoomId = action.payload;
		},
		setSelectedTool(state, action: PayloadAction<EditorState["selectedTool"]>) {
			state.selectedTool = action.payload;
		},
		addAsset(
			state,
			action: PayloadAction<{
				id: string;
				name: string;
				type: Asset["type"];
				url: string;
			}>,
		) {
			const escapeRoom = state.escapeRooms.find(
				(er) => er.id === state.currentEscapeRoomId,
			);
			if (escapeRoom) {
				escapeRoom.assets.push(action.payload);
			}
		},
		removeAsset(state, action: PayloadAction<{ id: string }>) {
			const escapeRoom = state.escapeRooms.find(
				(er) => er.id === state.currentEscapeRoomId,
			);
			if (escapeRoom) {
				escapeRoom.assets = escapeRoom.assets.filter(
					(asset) => asset.id !== action.payload.id,
				);
			}
		},
		updateMetadata(
			state,
			action: PayloadAction<{ key: keyof Metadata; value: any }>,
		) {
			const escapeRoom = state.escapeRooms.find(
				(er) => er.id === state.currentEscapeRoomId,
			);
			if (escapeRoom) {
				if (action.payload.key in escapeRoom.metadata) {
					escapeRoom.metadata[action.payload.key] = action.payload.value;
				} else {
					console.warn(
						`Invalid metadata key: ${action.payload.key}. Allowed keys are: name, description, thumbnail.`,
					);
				}
			}
		},
		addDoor(state, action: PayloadAction<{ row: number; col: number }>) {
			const escapeRoom = state.escapeRooms.find(
				(er) => er.id === state.currentEscapeRoomId,
			);
			const room = escapeRoom?.rooms.find((r) => r.id === state.currentRoomId);
			if (room) {
				room.door = action.payload;
			}
		},
		setDoorTexture(state, action: PayloadAction<{ texture: string }>) {
			const escapeRoom = state.escapeRooms.find(
				(er) => er.id === state.currentEscapeRoomId,
			);
			const room = escapeRoom?.rooms.find((r) => r.id === state.currentRoomId);
			if (room) {
				room.doorTexture = action.payload.texture; // Set the door texture
			}
		},
		addRiddle(
			state,
			action: PayloadAction<{
				id: string;
				position: { x: number; y: number };
				type: string;
				data: any;
			}>,
		) {
			const escapeRoom = state.escapeRooms.find(
				(er) => er.id === state.currentEscapeRoomId,
			);
			const room = escapeRoom?.rooms.find((r) => r.id === state.currentRoomId);
			if (room) {
				room.riddles.push(action.payload);
			}
		},
		setStartingPoint(
			state,
			action: PayloadAction<{ row: number; col: number }>,
		) {
			const escapeRoom = state.escapeRooms.find(
				(er) => er.id === state.currentEscapeRoomId,
			);
			const room = escapeRoom?.rooms.find((r) => r.id === state.currentRoomId);
			if (room) {
				room.startingPoint = action.payload; // Save the starting point in grid coordinates
			}
		},
		updateGrid(state, action: PayloadAction<{ key: string; active: boolean }>) {
			const escapeRoom = state.escapeRooms.find(
				(er) => er.id === state.currentEscapeRoomId,
			);
			const room = escapeRoom?.rooms.find((r) => r.id === state.currentRoomId);
			if (room) {
				if (action.payload.active) {
					room.grid[action.payload.key] = true; // Activate the grid cell
				} else {
					delete room.grid[action.payload.key]; // Deactivate the grid cell
				}
			}
		},
		updateWalls(state, action: PayloadAction<{ key: string; color: string }>) {
			const escapeRoom = state.escapeRooms.find(
				(er) => er.id === state.currentEscapeRoomId,
			);
			const room = escapeRoom?.rooms.find((r) => r.id === state.currentRoomId);

			if (room) {
				if (!room.walls) {
					room.walls = {};
				}
				room.walls[action.payload.key] = action.payload.color;
				room.wallColor = action.payload.color;
				room.walls = { ...room.walls };
			}
		},
		updateWallThickness(state, action: PayloadAction<number>) {
			const escapeRoom = state.escapeRooms.find(
				(er) => er.id === state.currentEscapeRoomId,
			);
			const room = escapeRoom?.rooms.find((r) => r.id === state.currentRoomId);
			if (room) {
				room.wallThickness = action.payload;
			}
		},
		acceptFloor(state) {
			const escapeRoom = state.escapeRooms.find(
				(er) => er.id === state.currentEscapeRoomId,
			);
			const room = escapeRoom?.rooms.find((r) => r.id === state.currentRoomId);
			if (room) {
				room.floorAccepted = true; // Mark the floor as accepted

				// Initialize walls for all active grid cells if not already set
				Object.keys(room.grid).forEach((key) => {
					if (!room.walls[key]) {
						room.walls[key] = room.wallColor; // Use the default wall color
					}
				});

				console.log("Floor accepted:", room.floorAccepted);
				console.log("Walls initialized:", room.walls);
			}
		},
		updateFloor(
			state,
			action: PayloadAction<{ color?: string; texture?: string | null }>,
		) {
			const escapeRoom = state.escapeRooms.find(
				(er) => er.id === state.currentEscapeRoomId,
			);
			const room = escapeRoom?.rooms.find((r) => r.id === state.currentRoomId);
			if (room) {
				if (action.payload.color) {
					room.floorColor = action.payload.color; // Update floor color
				}
				if (action.payload.texture !== undefined) {
					room.floorTexture = action.payload.texture; // Update floor texture
				}
			}
		},
		setFloorAndTexture(
			state,
			action: PayloadAction<{ color: string; texture: string | null }>,
		) {
			const escapeRoom = state.escapeRooms.find(
				(er) => er.id === state.currentEscapeRoomId,
			);
			const room = escapeRoom?.rooms.find((r) => r.id === state.currentRoomId);
			if (room) {
				room.floorColor = action.payload.color; // Set floor color
				room.floorTexture = action.payload.texture; // Set floor texture
			}
		},
		clearRoom(state) {
			const escapeRoom = state.escapeRooms.find(
				(er) => er.id === state.currentEscapeRoomId,
			);
			const room = escapeRoom?.rooms.find((r) => r.id === state.currentRoomId);
			if (room) {
				room.grid = {};
				room.walls = {}; // Reset wall colors
				room.floorTexture = null;
				room.floorColor = "#cccccc";
				room.wallColor = "#888888";
				room.wallThickness = 6; // Reset wall thickness
				room.door = null;
				room.doorTexture = null;
				room.startingPoint = null;
				room.riddles = [];
				room.floorAccepted = false; // Reset floor acceptance
			}
		},
	},
});

export const {
	setCurrentEscapeRoom,
	setCurrentRoom,
	setSelectedTool,
	addAsset,
	removeAsset,
	updateMetadata,
	addDoor,
	setDoorTexture,
	addRiddle,
	setStartingPoint,
	updateGrid,
	updateWalls,
	updateWallThickness,
	isBorderClosed,
	fillGrid,
	acceptFloor,
	updateFloor,
	setFloorAndTexture,
	clearRoom,
} = editorSlice.actions;

export default editorSlice.reducer;
