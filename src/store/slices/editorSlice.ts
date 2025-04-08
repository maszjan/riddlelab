/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
	isDoorValid,
	isRiddleValid,
	isPropValid,
	suggestValidPosition,
	isStartingPointValid,
} from "../../utils/editorHelpers";

interface Prop {
	id: string;
	name: string;
	imageUrl: string;
	position: { row: number; col: number };
	rotation: number;
	hasCollider: boolean;
}

interface Metadata {
	name: string;
	description: string;
	thumbnail: string | null;
	soundtrack: string | null;
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
	door: {
		row: number;
		col: number;
		rotation: number;
	} | null;
	doorTexture: string | null;
	startingPoint: { row: number; col: number } | null;
	riddles: Riddle[];
	props: Prop[];
	floorAccepted: boolean;
}

interface EscapeRoom {
	id: string;
	name: string;
	description: string;
	thumbnail: string | null;
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
		| "walls"
		| "clearRoom"
		| "metadata"
		| "roomManager";
	selectedRiddle: string | null;
}

const initialState: EditorState = {
	currentEscapeRoomId: "escapeRoom1",
	escapeRooms: [
		{
			id: "escapeRoom1",
			name: "Escape Room 1",
			description: "An exciting escape room adventure.",
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
					floorColor: "#cccccc",
					wallColor: "#888888",
					wallThickness: 6,
					floorTexture: null,
					door: null,
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
};

const editorSlice = createSlice({
	name: "editor",
	initialState,
	reducers: {
		setSelectedRiddle(state, action: PayloadAction<string | null>) {
			state.selectedRiddle = action.payload;
		},
		setSelectedTool(state, action: PayloadAction<EditorState["selectedTool"]>) {
			state.selectedTool = action.payload;
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
						`Invalid metadata key: ${action.payload.key}. Allowed keys are: name, description, thumbnail, soundtrack.`,
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
				const doorPosition = action.payload;

				if (isDoorValid(room.grid, doorPosition)) {
					room.door = {
						...doorPosition,
						rotation: 0,
					};
				} else {
					console.warn("Cannot place door on invalid grid position");
					const validPosition = suggestValidPosition(room.grid);
					if (validPosition) {
						room.door = {
							...validPosition,
							rotation: 0,
						};
					}
				}
			}
		},
		updateDoorTransformation(
			state,
			action: PayloadAction<{
				rotation?: number;
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
		setDoorTexture(state, action: PayloadAction<{ texture: string | null }>) {
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
				position: { row: number; col: number };
				type: string;
				title: string;
				question: string;
				answer: string;
				hints: string[];
				options: any;
			}>,
		) {
			const escapeRoom = state.escapeRooms.find(
				(er) => er.id === state.currentEscapeRoomId,
			);
			const room = escapeRoom?.rooms.find((r) => r.id === state.currentRoomId);

			if (room) {
				const riddlePosition = action.payload.position;

				// Validate the riddle position before saving
				if (isRiddleValid(room.grid, riddlePosition)) {
					room.riddles.push({
						id: action.payload.id,
						position: riddlePosition,
						type: action.payload.type,
						data: {
							title: action.payload.title,
							question: action.payload.question,
							answer: action.payload.answer,
							hints: action.payload.hints,
							options: action.payload.options,
						},
					});
					console.log(
						`Riddle placed at (${riddlePosition.row}, ${riddlePosition.col})`,
					);
				} else {
					console.warn("Cannot place riddle on invalid grid position");
					// Optionally suggest a valid position
					const validPosition = suggestValidPosition(room.grid);
					if (validPosition) {
						room.riddles.push({
							id: action.payload.id,
							position: validPosition,
							type: action.payload.type,
							data: {
								title: action.payload.title,
								question: action.payload.question,
								answer: action.payload.answer,
								hints: action.payload.hints,
								options: action.payload.options,
							},
						});
						console.log(
							`Riddle auto-placed at valid position (${validPosition.row}, ${validPosition.col})`,
						);
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
					room.riddles[riddleIndex].position = action.payload.position;
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

				// Validate the starting point position before saving
				if (isStartingPointValid(room.grid, startingPointPosition)) {
					room.startingPoint = startingPointPosition; // Save the starting point in grid coordinates
					console.log(
						`Starting point set at (${startingPointPosition.row}, ${startingPointPosition.col})`,
					);
				} else {
					console.warn("Cannot place starting point on invalid grid position");
					// Optionally suggest a valid position
					const validPosition = suggestValidPosition(room.grid);
					if (validPosition) {
						room.startingPoint = validPosition;
						console.log(
							`Starting point auto-placed at valid position (${validPosition.row}, ${validPosition.col})`,
						);
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
				room.floorAccepted = true;

				Object.keys(room.grid).forEach((key) => {
					if (!room.walls[key]) {
						room.walls[key] = room.wallColor;
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
					room.floorColor = action.payload.color;
				}
				if (action.payload.texture !== undefined) {
					room.floorTexture = action.payload.texture;
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
				room.floorColor = action.payload.color;
				room.floorTexture = action.payload.texture;
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
				room.floorColor = "#cccccc";
				room.wallColor = "#888888";
				room.wallThickness = 6;
				room.door = null;
				room.doorTexture = null;
				room.startingPoint = null;
				room.riddles = [];
				room.floorAccepted = false;
			}
		},

		addProp(
			state,
			action: PayloadAction<{
				roomId: string;
				prop: Prop;
			}>,
		) {
			const room = state.escapeRooms
				.flatMap((er) => er.rooms)
				.find((r) => r.id === action.payload.roomId);

			if (room) {
				const propPosition = action.payload.prop.position;

				// Validate the prop position before saving
				if (isPropValid(room.grid, propPosition)) {
					room.props.push(action.payload.prop);
					console.log(
						`Prop placed at (${propPosition.row}, ${propPosition.col})`,
					);
				} else {
					console.warn("Cannot place prop on invalid grid position");
					// Optionally suggest a valid position
					const validPosition = suggestValidPosition(room.grid);
					if (validPosition) {
						room.props.push({
							...action.payload.prop,
							position: validPosition,
						});
						console.log(
							`Prop auto-placed at valid position (${validPosition.row}, ${validPosition.col})`,
						);
					}
				}
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
		updateProp(
			state,
			action: PayloadAction<{
				roomId: string;
				propId: string;
				updates: Partial<Prop>;
			}>,
		) {
			const room = state.escapeRooms
				.flatMap((er) => er.rooms)
				.find((r) => r.id === action.payload.roomId);
			if (room) {
				const propIndex = room.props.findIndex(
					(p) => p.id === action.payload.propId,
				);
				if (propIndex !== -1) {
					room.props[propIndex] = {
						...room.props[propIndex],
						...action.payload.updates,
					};
				}
			}
		},
		addRoom(state, action: PayloadAction<Room>) {
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
		addEscapeRoom(state, action: PayloadAction<EscapeRoom>) {
			state.escapeRooms.push(action.payload);
		},
		setCurrentEscapeRoom(state, action: PayloadAction<string>) {
			state.currentEscapeRoomId = action.payload;
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
	addRoom,
	selectedRiddle,
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
	addProp,
	removeProp,
	updateProp,
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
