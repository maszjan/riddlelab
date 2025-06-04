/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
	isDoorValid,
	isRiddleValid,
	isPropValid,
	suggestValidPosition,
	isStartingPointValid,
} from "../../utils/editorHelpers";
import { Room, Riddle, EscapeRoom } from "../../interfaces";

// Extended Room interface for editor-specific properties
interface EditorRoom extends Omit<Room, "walls" | "grid" | "door"> {
	escapeRoomId: string;
	grid: { [key: string]: boolean };
	walls: { [key: string]: string };
	wallColor: string;
	floorColor?: string;
	floorAccepted: boolean;
	door: {
		row: number;
		col: number;
		rotation: number;
		scaleX?: number;
		scaleY?: number;
		opacity?: number;
	};
	startingPoint?: { row: number; col: number } | null;
}

// Extended EscapeRoom interface for editor
interface EditorEscapeRoom
	extends Omit<EscapeRoom, "rooms" | "metadata" | "currentRoomIndex"> {
	name: string;
	description: string;
	thumbnail: string | null;
	metadata: {
		name: string;
		description: string;
		thumbnail: string | null;
		soundtrack: string | null;
	};
	rooms: EditorRoom[];
}

// Extended EditorState with proper types
interface ExtendedEditorState {
	currentEscapeRoomId: string;
	escapeRooms: EditorEscapeRoom[];
	currentRoomId: string;
	selectedTool:
		| "paintFloor"
		| "eraseFloor"
		| "door"
		| "startPoint"
		| "riddle"
		| "walls"
		| "clearRoom"
		| "metadata"
		| "roomManager"
		| "props";
	selectedRiddle: string | null;
	selectedProp: string | null;
}

const initialState: ExtendedEditorState = {
	currentEscapeRoomId: "escapeRoom1",
	escapeRooms: [
		{
			id: "escapeRoom1",
			name: "Escape Room 1",
			description: "An exciting escape room adventure.",
			thumbnail: null,
			metadata: {
				name: "Escape Room 1",
				description: "An exciting escape room adventure.",
				thumbnail: null,
				soundtrack: null,
			},
			rooms: [
				{
					id: "room1",
					escapeRoomId: "escapeRoom1",
					grid: {},
					walls: {},
					name: "Room 1",
					floorColor: "#cccccc",
					wallColor: "#888888",
					wallThickness: 6,
					floorTexture: null,
					floorTextureAssetId: null,
					door: {
						row: 0,
						col: 0,
						rotation: 0,
						scaleX: 1,
						scaleY: 1,
						opacity: 1,
					},
					doorTexture: null,
					doorTextureAssetId: null,
					startingPoint: null,
					riddles: [],
					props: [],
					floorAccepted: false,
				},
			],
		},
	],
	currentRoomId: "room1",
	selectedTool: "paintFloor",
	selectedRiddle: null,
	selectedProp: null,
};

const editorSlice = createSlice({
	name: "editor",
	initialState,
	reducers: {
		clearEditor(state) {
			const newEscapeRoomId = `escape-room-${Date.now()}`;
			const newRoomId = `room-${Date.now()}`;
			state.currentEscapeRoomId = newEscapeRoomId;
			state.escapeRooms = [
				{
					id: newEscapeRoomId,
					name: "Nowy Escape Room",
					description: "Opis nowego escape room",
					thumbnail: null,
					metadata: {
						name: "Nowy Escape Room",
						description: "Opis nowego escape room",
						thumbnail: null,
						soundtrack: null,
					},
					rooms: [
						{
							id: newRoomId,
							escapeRoomId: newEscapeRoomId,
							grid: {},
							walls: {},
							name: "Room 1",
							floorColor: "#cccccc",
							wallColor: "#888888",
							wallThickness: 6,
							floorTexture: null,
							floorTextureAssetId: null,
							door: {
								row: 0,
								col: 0,
								rotation: 0,
								scaleX: 1,
								scaleY: 1,
								opacity: 1,
							},
							doorTexture: null,
							doorTextureAssetId: null,
							startingPoint: null,
							riddles: [],
							props: [],
							floorAccepted: false,
						},
					],
				},
			];
			state.currentRoomId = newRoomId;
			state.selectedTool = "paintFloor";
			state.selectedRiddle = null;
			state.selectedProp = null;
		},
		setCurrentEscapeRoom(state, action: PayloadAction<any>) {
			if (typeof action.payload === "string") {
				state.currentEscapeRoomId = action.payload;
			} else {
				const escapeRoom = action.payload;
				state.escapeRooms = state.escapeRooms.filter(
					(er) => er.id !== escapeRoom.id,
				);
				state.escapeRooms.push(escapeRoom);
				state.currentEscapeRoomId = escapeRoom.id;
				if (escapeRoom.rooms && escapeRoom.rooms.length > 0) {
					state.currentRoomId = escapeRoom.rooms[0].id;
				}
			}
		},
		setSelectedRiddle(state, action: PayloadAction<string | null>) {
			state.selectedRiddle = action.payload;
		},
		setSelectedTool(
			state,
			action: PayloadAction<ExtendedEditorState["selectedTool"]>,
		) {
			state.selectedTool = action.payload;
		},
		updateMetadata(state, action: PayloadAction<{ key: string; value: any }>) {
			const escapeRoom = state.escapeRooms.find(
				(er) => er.id === state.currentEscapeRoomId,
			);
			if (escapeRoom && escapeRoom.metadata) {
				(escapeRoom.metadata as any)[action.payload.key] = action.payload.value;
			}
		},
		addDoor(state, action: PayloadAction<{ row: number; col: number }>) {
			const escapeRoom = state.escapeRooms.find(
				(er) => er.id === state.currentEscapeRoomId,
			);
			const room = escapeRoom?.rooms.find((r) => r.id === state.currentRoomId);

			if (room) {
				const doorPosition = action.payload;

				if (isDoorValid(room.grid, doorPosition)) {
					room.door = {
						...doorPosition,
						rotation: 0,
						scaleX: 1,
						scaleY: 1,
						opacity: 1,
					};
				} else {
					console.warn("Cannot place door on invalid grid position");
					const validPosition = suggestValidPosition(room.grid);
					if (validPosition) {
						room.door = {
							...validPosition,
							rotation: 0,
							scaleX: 1,
							scaleY: 1,
							opacity: 1,
						};
					}
				}
			}
		},
		updateDoorTransformation(
			state,
			action: PayloadAction<{
				rotation?: number;
				scaleX?: number;
				scaleY?: number;
				opacity?: number;
			}>,
		) {
			const escapeRoom = state.escapeRooms.find(
				(er) => er.id === state.currentEscapeRoomId,
			);
			const room = escapeRoom?.rooms.find((r) => r.id === state.currentRoomId);
			if (room && room.door) {
				if (action.payload.rotation !== undefined) {
					room.door.rotation = action.payload.rotation;
				}
				if (action.payload.scaleX !== undefined) {
					room.door.scaleX = action.payload.scaleX;
				}
				if (action.payload.scaleY !== undefined) {
					room.door.scaleY = action.payload.scaleY;
				}
				if (action.payload.opacity !== undefined) {
					room.door.opacity = action.payload.opacity;
				}
			}
		},
		setDoorTexture(
			state,
			action: PayloadAction<{
				texture: string | null;
				doorTextureAssetId: number | null; // Changed from textureAssetId
			}>,
		) {
			const escapeRoom = state.escapeRooms.find(
				(er) => er.id === state.currentEscapeRoomId,
			);
			const room = escapeRoom?.rooms.find((r) => r.id === state.currentRoomId);
			if (room) {
				room.doorTexture = action.payload.texture;
				room.doorTextureAssetId = action.payload.doorTextureAssetId; // Updated reference
			}
		},
		// ... (continue with all the other reducers from your original file)
		addRiddle(
			state,
			action: PayloadAction<{
				id: string;
				position: { row: number; col: number };
				type: string;
				title: string;
				question: string;
				answer: string;
				hints: string[];
				options: any;
				assetId: number | null;
				texture: string | null;
			}>,
		) {
			const escapeRoom = state.escapeRooms.find(
				(er) => er.id === state.currentEscapeRoomId,
			);
			const room = escapeRoom?.rooms.find((r) => r.id === state.currentRoomId);

			if (room) {
				const riddlePosition = action.payload.position;

				const riddleObj = {
					id: action.payload.id,
					position: riddlePosition,
					type: action.payload.type as any,
					title: action.payload.title,
					question: action.payload.question,
					answer: action.payload.answer,
					hints: action.payload.hints,
					options: action.payload.options,
					assetId: action.payload.assetId,
					texture: action.payload.texture,
				};

				if (isRiddleValid(room.grid, riddlePosition)) {
					room.riddles.push(riddleObj);
				} else {
					console.warn("Cannot place riddle on invalid grid position");
					const validPosition = suggestValidPosition(room.grid);
					if (validPosition) {
						room.riddles.push({
							...riddleObj,
							position: validPosition,
						});
					}
				}
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
					room.floorColor = action.payload.color;
				}
				if (action.payload.texture !== undefined) {
					room.floorTexture = action.payload.texture;
				}
			}
		},
		clearRoom(state) {
			const escapeRoom = state.escapeRooms.find(
				(er) => er.id === state.currentEscapeRoomId,
			);
			const room = escapeRoom?.rooms.find((r) => r.id === state.currentRoomId);
			if (room) {
				room.grid = {};
				room.walls = {};
				room.floorTexture = null;
				room.floorTextureAssetId = null;
				room.floorColor = "#e8e8e8";
				room.wallColor = "#888888";
				room.wallThickness = 6;
				room.door = {
					row: 0,
					col: 0,
					rotation: 0,
					scaleX: 1,
					scaleY: 1,
					opacity: 1,
				};
				room.doorTexture = null;
				room.doorTextureAssetId = null;
				room.startingPoint = null;
				room.riddles = [];
				room.props = [];
				room.floorAccepted = false;
			}
		},
		addProp(
			state,
			action: PayloadAction<{
				roomId: string;
				prop: {
					id: string;
					name: string;
					imageUrl?: string;
					assetId: number | null;
					position: { row: number; col: number };
					rotation: number;
					hasCollider: boolean;
					flipHorizontal?: boolean;
					flipVertical?: boolean;
				};
			}>,
		) {
			const room = state.escapeRooms
				.flatMap((er) => er.rooms)
				.find((r) => r.id === action.payload.roomId);

			if (room) {
				const propPosition = action.payload.prop.position;

				const newProp = {
					...action.payload.prop,
					imageUrl: action.payload.prop.imageUrl || "",
					flipHorizontal: action.payload.prop.flipHorizontal || false,
					flipVertical: action.payload.prop.flipVertical || false,
				};

				if (isPropValid(room.grid, propPosition)) {
					room.props.push(newProp);
				} else {
					console.warn("Cannot place prop on invalid grid position");
					const validPosition = suggestValidPosition(room.grid);
					if (validPosition) {
						room.props.push({
							...newProp,
							position: validPosition,
						});
					}
				}
			}
		},
		updatePropReflection(
			state,
			action: PayloadAction<{
				propId: string;
				flipHorizontal?: boolean;
				flipVertical?: boolean;
			}>,
		) {
			const escapeRoom = state.escapeRooms.find(
				(er) => er.id === state.currentEscapeRoomId,
			);
			const room = escapeRoom?.rooms.find((r) => r.id === state.currentRoomId);
			if (room) {
				const propIndex = room.props.findIndex(
					(p) => p.id === action.payload.propId,
				);
				if (propIndex !== -1) {
					const prop = room.props[propIndex];
					if (action.payload.flipHorizontal !== undefined) {
						(prop as any).flipHorizontal = action.payload.flipHorizontal;
					}
					if (action.payload.flipVertical !== undefined) {
						(prop as any).flipVertical = action.payload.flipVertical;
					}
				}
			}
		},
		updateRiddle(
			state,
			action: PayloadAction<{
				riddleId: string;
				updates: Partial<Riddle>;
			}>,
		) {
			const escapeRoom = state.escapeRooms.find(
				(er) => er.id === state.currentEscapeRoomId,
			);
			const room = escapeRoom?.rooms.find((r) => r.id === state.currentRoomId);
			if (room) {
				const riddleIndex = room.riddles.findIndex(
					(r) => r.id === action.payload.riddleId,
				);
				if (riddleIndex !== -1) {
					room.riddles[riddleIndex] = {
						...room.riddles[riddleIndex],
						...action.payload.updates,
					};
				}
			}
		},
		updateRiddlePosition(
			state,
			action: PayloadAction<{
				riddleId: string;
				position: { row: number; col: number };
			}>,
		) {
			const escapeRoom = state.escapeRooms.find(
				(er) => er.id === state.currentEscapeRoomId,
			);
			const room = escapeRoom?.rooms.find((r) => r.id === state.currentRoomId);
			if (room) {
				const riddleIndex = room.riddles.findIndex(
					(r) => r.id === action.payload.riddleId,
				);
				if (riddleIndex !== -1) {
					const newPosition = action.payload.position;
					if (isRiddleValid(room.grid, newPosition)) {
						room.riddles[riddleIndex].position = newPosition;
					} else {
						const validPosition = suggestValidPosition(room.grid);
						if (validPosition) {
							room.riddles[riddleIndex].position = validPosition;
						}
					}
				}
			}
		},
		removeRiddle(
			state,
			action: PayloadAction<{
				riddleId: string;
			}>,
		) {
			const escapeRoom = state.escapeRooms.find(
				(er) => er.id === state.currentEscapeRoomId,
			);
			const room = escapeRoom?.rooms.find((r) => r.id === state.currentRoomId);
			if (room) {
				room.riddles = room.riddles.filter(
					(r) => r.id !== action.payload.riddleId,
				);
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
				const startingPointPosition = action.payload;

				if (isStartingPointValid(room.grid, startingPointPosition)) {
					room.startingPoint = startingPointPosition;
				} else {
					const validPosition = suggestValidPosition(room.grid);
					if (validPosition) {
						room.startingPoint = validPosition;
					}
				}
			}
		},
		updateGrid(state, action: PayloadAction<{ key: string; active: boolean }>) {
			const escapeRoom = state.escapeRooms.find(
				(er) => er.id === state.currentEscapeRoomId,
			);
			const room = escapeRoom?.rooms.find((r) => r.id === state.currentRoomId);
			if (room) {
				if (action.payload.active) {
					room.grid[action.payload.key] = true;
				} else {
					delete room.grid[action.payload.key];
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
				room.floorAccepted = true;
				Object.keys(room.grid).forEach((key) => {
					if (!room.walls[key]) {
						room.walls[key] = room.wallColor;
					}
				});
			}
		},
		setFloorAndTexture(
			state,
			action: PayloadAction<{
				color: string | null;
				texture: string | null;
				textureAssetId: number | null;
			}>,
		) {
			const escapeRoom = state.escapeRooms.find(
				(er) => er.id === state.currentEscapeRoomId,
			);
			const room = escapeRoom?.rooms.find((r) => r.id === state.currentRoomId);
			if (room) {
				room.floorTexture = action.payload.texture;
				room.floorTextureAssetId = action.payload.textureAssetId;
			}
		},
		removeProp(
			state,
			action: PayloadAction<{ roomId: string; propId: string }>,
		) {
			const room = state.escapeRooms
				.flatMap((er) => er.rooms)
				.find((r) => r.id === action.payload.roomId);
			if (room) {
				room.props = room.props.filter(
					(prop) => prop.id !== action.payload.propId,
				);
			}
		},
		updatePropPosition(
			state,
			action: PayloadAction<{
				propId: string;
				position: { row: number; col: number };
			}>,
		) {
			const escapeRoom = state.escapeRooms.find(
				(er) => er.id === state.currentEscapeRoomId,
			);
			const room = escapeRoom?.rooms.find((r) => r.id === state.currentRoomId);
			if (room) {
				const propIndex = room.props.findIndex(
					(p) => p.id === action.payload.propId,
				);
				if (propIndex !== -1) {
					const propPosition = action.payload.position;

					if (isPropValid(room.grid, propPosition)) {
						room.props[propIndex].position = propPosition;
					} else {
						const validPosition = suggestValidPosition(room.grid);
						if (validPosition) {
							room.props[propIndex].position = validPosition;
						}
					}
				}
			}
		},
		setSelectedProp(state, action: PayloadAction<string | null>) {
			state.selectedProp = action.payload;
		},
		updatePropRotation(
			state,
			action: PayloadAction<{
				propId: string;
				rotation: number;
			}>,
		) {
			const escapeRoom = state.escapeRooms.find(
				(er) => er.id === state.currentEscapeRoomId,
			);
			const room = escapeRoom?.rooms.find((r) => r.id === state.currentRoomId);
			if (room) {
				const propIndex = room.props.findIndex(
					(p) => p.id === action.payload.propId,
				);
				if (propIndex !== -1) {
					room.props[propIndex].rotation = action.payload.rotation;
				}
			}
		},
		addRoom(state, action: PayloadAction<EditorRoom>) {
			const escapeRoom = state.escapeRooms.find(
				(er) => er.id === action.payload.escapeRoomId,
			);
			if (escapeRoom) {
				escapeRoom.rooms.push(action.payload);
			}
		},
		removeRoom(state, action: PayloadAction<{ roomId: string }>) {
			const escapeRoom = state.escapeRooms.find(
				(er) => er.id === state.currentEscapeRoomId,
			);
			if (escapeRoom) {
				escapeRoom.rooms = escapeRoom.rooms.filter(
					(room) => room.id !== action.payload.roomId,
				);
			}
		},
		setCurrentRoom(state, action: PayloadAction<string>) {
			state.currentRoomId = action.payload;
		},
		addEscapeRoom(state, action: PayloadAction<EditorEscapeRoom>) {
			state.escapeRooms.push(action.payload);
		},
		removeEscapeRoom(state, action: PayloadAction<{ id: string }>) {
			state.escapeRooms = state.escapeRooms.filter(
				(er) => er.id !== action.payload.id,
			);

			if (
				state.currentEscapeRoomId === action.payload.id &&
				state.escapeRooms.length > 0
			) {
				state.currentEscapeRoomId = state.escapeRooms[0].id;
				state.currentRoomId = state.escapeRooms[0].rooms[0]?.id || "";
			}
		},
		setSoundtrack(state, action: PayloadAction<{ soundtrack: string | null }>) {
			const escapeRoom = state.escapeRooms.find(
				(er) => er.id === state.currentEscapeRoomId,
			);
			if (escapeRoom) {
				escapeRoom.metadata.soundtrack = action.payload.soundtrack;
			}
		},
	},
});

export const {
	setCurrentEscapeRoom,
	clearEditor,
	addRoom,
	updateRiddle,
	removeRiddle,
	setSelectedRiddle,
	updateRiddlePosition,
	removeRoom,
	setCurrentRoom,
	setSelectedTool,
	updateMetadata,
	addDoor,
	updateDoorTransformation,
	setDoorTexture,
	addRiddle,
	setStartingPoint,
	setSelectedProp,
	addProp,
	removeProp,
	updatePropPosition,
	updatePropReflection,
	updatePropRotation,
	updateGrid,
	updateWalls,
	updateWallThickness,
	acceptFloor,
	updateFloor,
	setFloorAndTexture,
	setSoundtrack,
	clearRoom,
} = editorSlice.actions;

export default editorSlice.reducer;
