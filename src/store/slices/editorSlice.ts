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
	assetId: number | null;
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
	assetId: number | null;
	texture: string | null;
}

interface Room {
	id: string;
	escapeRoomId: string;
	grid: { [key: string]: boolean };
	walls: { [key: string]: string };
	wallColor: string;
	wallThickness: number;
	floorTexture: string | null;
	floorTextureAssetId: number | null;
	door: {
		row: number;
		col: number;
		rotation: number;
	} | null;
	doorTexture: string | null;
	doorTextureAssetId: number | null;
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
	selectedProp: string | null;
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
					floorTextureAssetId: null, // Add this
					door: null,
					doorTexture: null,
					doorTextureAssetId: null, // Add this
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
	selectedProp: null, // Add this
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
							floorColor: "#cccccc",
							wallColor: "#888888",
							wallThickness: 6,
							floorTexture: null,
							floorTextureAssetId: null,
							door: null,
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
		setDoorTexture(
			state,
			action: PayloadAction<{
				texture: string | null;
				textureAssetId: number | null;
			}>,
		) {
			const escapeRoom = state.escapeRooms.find(
				(er) => er.id === state.currentEscapeRoomId,
			);
			const room = escapeRoom?.rooms.find((r) => r.id === state.currentRoomId);
			if (room) {
				room.doorTexture = action.payload.texture;
				room.doorTextureAssetId = action.payload.textureAssetId;

				console.log("Redux: Setting door texture", {
					texture: action.payload.texture,
					textureAssetId: action.payload.textureAssetId,
				});
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
					type: action.payload.type,
					data: {
						title: action.payload.title,
						question: action.payload.question,
						answer: action.payload.answer,
						hints: action.payload.hints,
						options: action.payload.options,
					},
					assetId: action.payload.assetId,
					texture: action.payload.texture,
				};

				if (isRiddleValid(room.grid, riddlePosition)) {
					room.riddles.push(riddleObj);
					console.log(
						`Riddle placed at (${riddlePosition.row}, ${riddlePosition.col})`,
					);
				} else {
					console.warn("Cannot place riddle on invalid grid position");
					const validPosition = suggestValidPosition(room.grid);
					if (validPosition) {
						room.riddles.push({
							...riddleObj,
							position: validPosition,
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
					const newPosition = action.payload.position;
					if (isRiddleValid(room.grid, newPosition)) {
						room.riddles[riddleIndex].position = newPosition;
						console.log(
							`Riddle moved to (${newPosition.row}, ${newPosition.col})`,
						);
					} else {
						console.warn("Cannot move riddle to invalid grid position");
						const validPosition = suggestValidPosition(room.grid);
						if (validPosition) {
							room.riddles[riddleIndex].position = validPosition;
							console.log(
								`Riddle auto-moved to valid position (${validPosition.row}, ${validPosition.col})`,
							);
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
			action: PayloadAction<{
				color: string | null; // Keep for compatibility but won't be used
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
				room.floorColor = "#e8e8e8"; // Light neutral gray as fallback
				room.wallColor = "#888888";
				room.wallThickness = 6;
				room.door = null;
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
					imageUrl?: string; // Optional for backward compatibility
					assetId: number | null; // Asset ID from server
					position: { row: number; col: number };
					rotation: number;
					hasCollider: boolean;
				};
			}>,
		) {
			const room = state.escapeRooms
				.flatMap((er) => er.rooms)
				.find((r) => r.id === action.payload.roomId);

			if (room) {
				const propPosition = action.payload.prop.position;

				const newProp: Prop = {
					...action.payload.prop,
					imageUrl: action.payload.prop.imageUrl || "", // Fallback for compatibility
				};

				if (isPropValid(room.grid, propPosition)) {
					room.props.push(newProp);
					console.log(
						`Prop placed at (${propPosition.row}, ${propPosition.col})`,
					);
				} else {
					console.warn("Cannot place prop on invalid grid position");
					const validPosition = suggestValidPosition(room.grid);
					if (validPosition) {
						room.props.push({
							...newProp,
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

					// Validate the prop position before updating
					if (isPropValid(room.grid, propPosition)) {
						room.props[propIndex].position = propPosition;
						console.log(
							`Prop moved to (${propPosition.row}, ${propPosition.col})`,
						);
					} else {
						console.warn("Cannot move prop to invalid grid position");
						// Optionally suggest a valid position
						const validPosition = suggestValidPosition(room.grid);
						if (validPosition) {
							room.props[propIndex].position = validPosition;
							console.log(
								`Prop auto-moved to valid position (${validPosition.row}, ${validPosition.col})`,
							);
						}
					}
				}
			}
		},
		setSelectedProp(state, action: PayloadAction<string | null>) {
			state.selectedProp = action.payload;
		},
		// Add this action in the reducers section

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
						prop.flipHorizontal = action.payload.flipHorizontal;
					}
					if (action.payload.flipVertical !== undefined) {
						prop.flipVertical = action.payload.flipVertical;
					}
					console.log(`Prop ${action.payload.propId} reflection updated:`, {
						flipHorizontal: prop.flipHorizontal,
						flipVertical: prop.flipVertical,
					});
				}
			}
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
					console.log(
						`Prop ${action.payload.propId} rotated to ${action.payload.rotation}°`,
					);
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
