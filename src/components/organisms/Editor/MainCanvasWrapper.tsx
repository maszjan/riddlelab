/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { Stage, Layer, Rect, Line } from "react-konva";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../store";
import {
	updateGrid,
	addDoor,
	setStartingPoint,
	addRiddle,
	clearRoom,
	updateWalls,
	selectedRiddle,
} from "../../../store/slices/editorSlice";
import { v4 as uuidv4 } from "uuid";

const GRID_SIZE = 40; // Size of each grid cell
const ROOM_WIDTH = 30; // Number of columns
const ROOM_HEIGHT = 20; // Number of rows

const MainCanvasWrapper: React.FC = () => {
	const dispatch = useDispatch();
	const selectedTool = useSelector(
		(state: RootState) => state.editor.selectedTool,
	);
	const currentRoom = useSelector((state: RootState) => {
		const escapeRoom = state.editor.escapeRooms.find(
			(er) => er.id === state.editor.currentEscapeRoomId,
		);
		return escapeRoom?.rooms.find(
			(room) => room.id === state.editor.currentRoomId,
		);
	});
	const floorTextureUrl = currentRoom?.floorTexture;
	const paintingColor = currentRoom?.paintingColor || "#cccccc"; // Default painting color
	const floorColor = currentRoom?.floorColor || null; // Allow null for no color
	const wallColor = currentRoom?.wallColor || "#888888"; // Get the wall color
	const wallThickness = currentRoom?.wallThickness || 6; // Get the wall thickness dynamically
	const floorAccepted = currentRoom?.floorAccepted; // Check if the floor is accepted

	const [floorTexture, setFloorTexture] = useState<HTMLImageElement | null>(
		null,
	);
	const [doorTexture, setDoorTexture] = useState<HTMLImageElement | null>(null);
	const [propImages, setPropImages] = useState<
		Record<string, HTMLImageElement | null>
	>({});

	useEffect(() => {
		console.log("Loading all textures...");

		const loadTexture = (
			url: string | undefined,
			setTexture: React.Dispatch<React.SetStateAction<HTMLImageElement | null>>,
			textureName: string,
		) => {
			if (url) {
				console.log(`Loading ${textureName} texture from URL:`, url);
				const img = new Image();
				img.src = url;
				img.onload = () => {
					console.log(
						`${textureName} texture loaded successfully, dimensions:`,
						img.width,
						"x",
						img.height,
					);
					setTexture(img);
				};
				img.onerror = (err) => {
					console.error(
						`Failed to load ${textureName} texture from URL: ${url}`,
						err,
					);
					setTexture(null);
				};
			} else {
				console.log(`No ${textureName} texture URL provided`);
				setTexture(null);
			}
		};

		// Load floor texture
		loadTexture(floorTextureUrl, setFloorTexture, "floor");

		// Load door texture
		loadTexture(currentRoom?.doorTexture, setDoorTexture, "door");

		// Load prop textures
		if (currentRoom?.props && currentRoom.props.length > 0) {
			console.log(`Loading ${currentRoom.props.length} prop textures`);

			currentRoom.props.forEach((prop) => {
				if (prop.imageUrl) {
					const img = new Image();
					img.src = prop.imageUrl;
					img.onload = () => {
						console.log(
							`Prop texture loaded for ${prop.id}, dimensions:`,
							img.width,
							"x",
							img.height,
						);
						setPropImages((prev) => ({ ...prev, [prop.id]: img }));
					};
					img.onerror = (err) => {
						console.error(`Failed to load prop texture for ${prop.id}:`, err);
						setPropImages((prev) => ({ ...prev, [prop.id]: null }));
					};
				}
			});
		} else {
			console.log("No props to load textures for");
		}

		// Log texture state changes
		console.log("Floor texture:", floorTexture ? "Loaded" : "Not loaded");
		console.log("Door texture:", doorTexture ? "Loaded" : "Not loaded");
		console.log(
			"Prop textures:",
			Object.keys(propImages).length > 0
				? `${Object.keys(propImages).length} loaded`
				: "None loaded",
		);
	}, [floorTextureUrl, currentRoom?.doorTexture, currentRoom?.props]);

	const handleCellAction = (row: number, col: number) => {
		const key = `${row}-${col}`;
		switch (selectedTool) {
			case "paintFloor":
				if (!floorAccepted) {
					dispatch(updateGrid({ key, active: true }));
				}
				break;
			case "eraseFloor":
				if (!floorAccepted) {
					dispatch(updateGrid({ key, active: false }));
				}
				break;
			case "door":
				console.log("Adding door at position:", row, col);
				dispatch(addDoor({ row, col })); // Save door position in grid coordinates
				break;
			case "startPoint":
				dispatch(setStartingPoint({ row, col })); // Save starting point in grid coordinates
				break;
			case "props":
				if (selectedPropFromLibrary) {
					dispatch(
						addProp({
							roomId: currentRoom.id,
							prop: {
								id: `prop-${uuidv4()}`,
								name: selectedPropFromLibrary.name,
								imageUrl: selectedPropFromLibrary.imageUrl,
								position: { row, col },
								rotation: 0,
								hasCollider: selectedPropFromLibrary.hasCollider,
							},
						}),
					);
				}
				break;

			case "riddle":
				// Check if we already have 5 riddles
				if (currentRoom?.riddles && currentRoom.riddles.length >= 5) {
					console.log("Maximum number of riddles (5) reached");
					return;
				}

				dispatch(
					addRiddle({
						id: `riddle-${uuidv4()}`, // Use uuidv4 for unique IDs
						position: { row, col }, // Use row/col format instead of x/y
						type: "knowledge", // Default type
						title: "New Riddle",
						question: "What is the question?",
						answer: "",
						hints: [],
						options: {},
					}),
				);
				break;

			case "walls":
				if (floorAccepted) {
					dispatch(updateWalls({ key, color: wallColor })); // Update wall color
				}
				break;
			case "clearRoom":
				dispatch(clearRoom());
				break;
			default:
				break;
		}
	};

	const handleMouseDown = (event: any) => {
		const stage = event.target.getStage();
		const pointerPosition = stage.getPointerPosition();
		if (!pointerPosition) return;

		const col = Math.floor(pointerPosition.x / GRID_SIZE);
		const row = Math.floor(pointerPosition.y / GRID_SIZE);
		handleCellAction(row, col);
	};

	const handleMouseMove = (event: any) => {
		if (event.evt.buttons !== 1) return; // Only handle if the left mouse button is pressed
		const stage = event.target.getStage();
		const pointerPosition = stage.getPointerPosition();
		if (!pointerPosition) return;

		const col = Math.floor(pointerPosition.x / GRID_SIZE);
		const row = Math.floor(pointerPosition.y / GRID_SIZE);
		handleCellAction(row, col);
	};

	const renderGrid = () => {
		if (!currentRoom) {
			console.error("Current room is undefined");
			return null;
		}

		console.log("Rendering grid cells");
		const cells = [];
		for (let row = 0; row < ROOM_HEIGHT; row++) {
			for (let col = 0; col < ROOM_WIDTH; col++) {
				const key = `${row}-${col}`;
				const isActive = currentRoom.grid[key];

				if (isActive) {
					// Render texture layer (if texture exists)
					if (floorTexture) {
						cells.push(
							<Rect
								key={`${key}-texture`}
								x={col * GRID_SIZE}
								y={row * GRID_SIZE}
								width={GRID_SIZE}
								height={GRID_SIZE}
								fillPatternImage={floorTexture}
								fillPatternScale={{
									x: GRID_SIZE / floorTexture.width,
									y: GRID_SIZE / floorTexture.height,
								}}
								fillPatternOffset={{ x: 0, y: 0 }}
								stroke='#555'
								onMouseDown={handleMouseDown}
								onMouseMove={handleMouseMove}
							/>,
						);
					}

					// Render painting color if floorAccepted is false
					if (!floorAccepted && paintingColor) {
						cells.push(
							<Rect
								key={`${key}-painting-color`}
								x={col * GRID_SIZE}
								y={row * GRID_SIZE}
								width={GRID_SIZE}
								height={GRID_SIZE}
								fill={paintingColor}
								opacity={floorTexture ? 0.5 : 1} // Semi-transparent if texture exists
								stroke='#555'
								onMouseDown={handleMouseDown}
								onMouseMove={handleMouseMove}
							/>,
						);
					}

					// Render floor color if floorAccepted is true
					if (floorAccepted && floorColor) {
						cells.push(
							<Rect
								key={`${key}-floor-color`}
								x={col * GRID_SIZE}
								y={row * GRID_SIZE}
								width={GRID_SIZE}
								height={GRID_SIZE}
								fill={floorColor}
								opacity={floorTexture ? 0.5 : 1} // Semi-transparent if texture exists
								stroke='#555'
								onMouseDown={handleMouseDown}
								onMouseMove={handleMouseMove}
							/>,
						);
					}

					// Render transparent overlay if floorAccepted is true and no floorColor or texture exists
					if (floorAccepted && !floorColor && !floorTexture) {
						cells.push(
							<Rect
								key={`${key}-transparent`}
								x={col * GRID_SIZE}
								y={row * GRID_SIZE}
								width={GRID_SIZE}
								height={GRID_SIZE}
								fill='transparent'
								stroke='#555'
								onMouseDown={handleMouseDown}
								onMouseMove={handleMouseMove}
							/>,
						);
					}
				} else {
					// Render inactive cells
					cells.push(
						<Rect
							key={key}
							x={col * GRID_SIZE}
							y={row * GRID_SIZE}
							width={GRID_SIZE}
							height={GRID_SIZE}
							fill='transparent'
							stroke='#555'
							onMouseDown={handleMouseDown}
							onMouseMove={handleMouseMove}
						/>,
					);
				}
			}
		}
		console.log(`Rendered ${cells.length} grid cells`);
		return cells;
	};

	const renderWalls = () => {
		if (!currentRoom || !floorAccepted) {
			console.log("Not rendering walls - conditions not met:", {
				hasCurrentRoom: Boolean(currentRoom),
				floorAccepted: floorAccepted,
			});
			return null;
		}

		console.log("Rendering walls");
		const wallLines = [];
		const gridKeys = Object.keys(currentRoom.grid);

		// Helper function to check if a cell is active
		const isActive = (row: number, col: number) =>
			currentRoom.grid[`${row}-${col}`];

		// Iterate over all active cells and add walls around them
		gridKeys.forEach((key) => {
			const [row, col] = key.split("-").map(Number);

			// Top wall
			if (!isActive(row - 1, col)) {
				wallLines.push(
					<Line
						key={`top-wall-${key}`}
						points={[
							col * GRID_SIZE,
							row * GRID_SIZE,
							(col + 1) * GRID_SIZE,
							row * GRID_SIZE,
						]}
						stroke={wallColor}
						strokeWidth={wallThickness}
					/>,
				);
			}

			// Bottom wall
			if (!isActive(row + 1, col)) {
				wallLines.push(
					<Line
						key={`bottom-wall-${key}`}
						points={[
							col * GRID_SIZE,
							(row + 1) * GRID_SIZE,
							(col + 1) * GRID_SIZE,
							(row + 1) * GRID_SIZE,
						]}
						stroke={wallColor}
						strokeWidth={wallThickness}
					/>,
				);
			}

			// Left wall
			if (!isActive(row, col - 1)) {
				wallLines.push(
					<Line
						key={`left-wall-${key}`}
						points={[
							col * GRID_SIZE,
							row * GRID_SIZE,
							col * GRID_SIZE,
							(row + 1) * GRID_SIZE,
						]}
						stroke={wallColor}
						strokeWidth={wallThickness}
					/>,
				);
			}

			// Right wall
			if (!isActive(row, col + 1)) {
				wallLines.push(
					<Line
						key={`right-wall-${key}`}
						points={[
							(col + 1) * GRID_SIZE,
							row * GRID_SIZE,
							(col + 1) * GRID_SIZE,
							(row + 1) * GRID_SIZE,
						]}
						stroke={wallColor}
						strokeWidth={wallThickness}
					/>,
				);
			}
		});

		console.log(`Rendered ${wallLines.length} wall lines`);
		return wallLines;
	};

	const renderDoors = () => {
		console.log("Attempting to render doors");
		console.log("Door rendering conditions:", {
			hasDoor: Boolean(currentRoom?.door),
			doorTextureLoaded: Boolean(doorTexture),
		});

		if (!currentRoom?.door || !doorTexture) {
			console.log("Cannot render door - missing data");
			return null;
		}

		console.log("Rendering door with data:", currentRoom.door);

		// Render a single door instead of mapping through an array
		const door = currentRoom.door;
		const rotation = door.rotation || 0;

		return (
			<Rect
				key='door'
				x={door.col * GRID_SIZE}
				y={door.row * GRID_SIZE}
				width={GRID_SIZE}
				height={GRID_SIZE}
				fillPatternImage={doorTexture}
				fillPatternScale={{
					x: GRID_SIZE / doorTexture.width,
					y: GRID_SIZE / doorTexture.height,
				}}
				fillPatternOffset={{ x: 0, y: 0 }}
				fillPatternRotation={rotation} // Apply rotation to the texture pattern only
				stroke='#555'
				strokeWidth={2}
				shadowColor='black'
				shadowBlur={10}
				shadowOffset={{ x: 5, y: 5 }}
				shadowOpacity={0.5}
				shadowForStrokeEnabled={false}
			/>
		);
	};

	const renderStartingPoint = () => {
		console.log("Attempting to render starting point");
		console.log("Starting point data:", currentRoom?.startingPoint);

		if (!currentRoom?.startingPoint) {
			console.log("No starting point defined");
			return null;
		}

		const { row, col } = currentRoom.startingPoint;

		// Render a distinctive marker for the starting point
		return (
			<React.Fragment>
				{/* Circle to represent the starting point */}
				<Rect
					x={col * GRID_SIZE}
					y={row * GRID_SIZE}
					width={GRID_SIZE}
					height={GRID_SIZE}
					fill='transparent'
				/>
				{/* Add a "start" icon or text */}
				<Rect
					x={col * GRID_SIZE + GRID_SIZE / 4}
					y={row * GRID_SIZE + GRID_SIZE / 4}
					width={GRID_SIZE / 2}
					height={GRID_SIZE / 2}
					fill='#00AA00'
					cornerRadius={GRID_SIZE / 4}
				/>
			</React.Fragment>
		);
	};

	const renderProps = () => {
		console.log("Attempting to render props");

		if (!currentRoom?.props || currentRoom.props.length === 0) {
			console.log("No props to render");
			return null;
		}

		console.log(`Rendering ${currentRoom.props.length} props`);

		return currentRoom.props.map((prop) => {
			// Get the image for this specific prop from our state
			const propImage = propImages[prop.id];

			if (!propImage) {
				console.log(`No image loaded yet for prop ${prop.id}`);
				return null;
			}

			return (
				<Rect
					key={prop.id}
					x={prop.position.col * GRID_SIZE}
					y={prop.position.row * GRID_SIZE}
					width={GRID_SIZE}
					height={GRID_SIZE}
					fillPatternImage={propImage}
					fillPatternScale={{
						x: GRID_SIZE / propImage.width,
						y: GRID_SIZE / propImage.height,
					}}
					fillPatternRotation={prop.rotation || 0}
					stroke={prop.hasCollider ? "green" : "transparent"}
					strokeWidth={prop.hasCollider ? 2 : 0}
					onClick={() => setSelectedPropOnCanvas(prop.id)}
				/>
			);
		});
	};

	const renderRiddles = () => {
		if (!currentRoom?.riddles || currentRoom.riddles.length === 0) {
			return null;
		}

		return currentRoom.riddles.map((riddle) => {
			if (!riddle.position) return null;

			const { row, col } = riddle.position;
			const isSelected = riddle.id === selectedRiddle;

			return (
				<React.Fragment key={riddle.id}>
					{/* Transparent background */}
					<Rect
						x={col * GRID_SIZE}
						y={row * GRID_SIZE}
						width={GRID_SIZE}
						height={GRID_SIZE}
						fill='transparent'
					/>
					{/* Riddle marker */}
					<Rect
						x={col * GRID_SIZE + GRID_SIZE / 4}
						y={row * GRID_SIZE + GRID_SIZE / 4}
						width={GRID_SIZE / 2}
						height={GRID_SIZE / 2}
						fill={isSelected ? "#FF9900" : "#3BCEAC"}
						cornerRadius={GRID_SIZE / 4}
						onClick={() => dispatch(setSelectedRiddle(riddle.id))}
					/>
				</React.Fragment>
			);
		});
	};

	return (
		<Stage width={ROOM_WIDTH * GRID_SIZE} height={ROOM_HEIGHT * GRID_SIZE}>
			<Layer>{renderGrid()}</Layer>
			<Layer>{renderWalls()}</Layer>
			<Layer>{renderDoors()}</Layer>
			<Layer>{renderStartingPoint()}</Layer>
			<Layer>{renderProps()}</Layer>
			<Layer>{renderRiddles()}</Layer>
		</Stage>
	);
};

export default MainCanvasWrapper;
