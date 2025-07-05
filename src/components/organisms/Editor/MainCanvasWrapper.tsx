/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { Stage, Layer, Rect, Line } from "react-konva";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../store";
import {
	updateGrid,
	addDoor,
	setStartingPoint,
	updateRiddlePosition,
	updatePropPosition,
	clearRoom,
	updateWalls,
} from "../../../store/slices/editorSlice";
import { selectUser } from "../../../store/slices/userSlice";
import AvatarKonvaElements from "../../atoms/AvatarKonvaElements";
import useGetAsset from "../../../hooks/useGetAsset";

const GRID_SIZE = 40; // Size of each grid cell
const ROOM_WIDTH = 30; // Number of columns
const ROOM_HEIGHT = 20; // Number of rows

const MainCanvasWrapper: React.FC = () => {
	const dispatch = useDispatch();
	const user = useSelector(selectUser);

	const selectedTool = useSelector(
		(state: RootState) => state.editor.selectedTool,
	);
	const selectedRiddle = useSelector(
		(state: RootState) => state.editor.selectedRiddle,
	);
	const selectedProp = useSelector(
		(state: RootState) => state.editor.selectedProp,
	);

	const currentRoom = useSelector((state: RootState) => {
		const escapeRoom = state.editor.escapeRooms.find(
			(er) => er.id === state.editor.currentEscapeRoomId,
		);
		return escapeRoom?.rooms.find(
			(room) => room.id === state.editor.currentRoomId,
		);
	});

	// Add this hook to fetch door texture asset
	const { asset: doorTextureAsset } = useGetAsset(
		currentRoom?.doorTextureAssetId || null,
	);

	const floorTextureUrl = currentRoom?.floorTexture;
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
	const [riddleImages, setRiddleImages] = useState<
		Record<string, HTMLImageElement | null>
	>({});

	const getImageUrl = (url: string | null): string | null => {
		if (!url) return null;

		if (url.startsWith("http")) {
			return url;
		}

		if (url.startsWith("/storage/")) {
			return `${import.meta.env.VITE_API_URL}${url}`;
		} else if (url.startsWith("textures/")) {
			return `${import.meta.env.VITE_API_URL}/storage/${url}`;
		} else if (url.startsWith("/")) {
			return `${import.meta.env.VITE_API_URL}${url}`;
		} else {
			return `${import.meta.env.VITE_API_URL}/storage/${url}`;
		}
	};

	useEffect(() => {
		const loadTexture = (
			url: string | undefined,
			setTexture: React.Dispatch<React.SetStateAction<HTMLImageElement | null>>,
			textureName: string,
		) => {
			if (url) {
				const fullUrl = getImageUrl(url);
				if (fullUrl) {
					const img = new Image();
					img.src = fullUrl;
					img.onload = () => {
						console.log(`${textureName} texture loaded successfully:`, fullUrl);
						setTexture(img);
					};
					img.onerror = (err) => {
						console.error(
							`Failed to load ${textureName} texture:`,
							fullUrl,
							err,
						);
						setTexture(null);
					};
				}
			} else {
				setTexture(null);
			}
		};

		// Load floor texture
		if (floorTextureUrl) {
			console.log("Loading floor texture:", floorTextureUrl);
			loadTexture(floorTextureUrl, setFloorTexture, "floor");
		} else {
			setFloorTexture(null);
		}

		// Load door texture - prioritize doorTexture, fallback to asset URL
		const doorTextureUrl = currentRoom?.doorTexture || doorTextureAsset?.url;
		if (doorTextureUrl) {
			console.log("Loading door texture:", doorTextureUrl);
			loadTexture(doorTextureUrl, setDoorTexture, "door");
		} else {
			setDoorTexture(null);
		}

		if (currentRoom?.props && currentRoom.props.length > 0) {
			const newPropImages: Record<string, HTMLImageElement | null> = {};
			currentRoom.props.forEach((prop) => {
				if (prop.imageUrl) {
					console.log(`Loading prop texture for ${prop.id}:`, prop.imageUrl);
					const fullUrl = getImageUrl(prop.imageUrl);
					if (fullUrl) {
						const img = new Image();
						img.src = fullUrl;
						img.onload = () => {
							console.log(`Prop texture loaded for ${prop.id}:`, fullUrl);
							setPropImages((prev) => ({ ...prev, [prop.id]: img }));
						};
						img.onerror = (err) => {
							console.error(
								`Failed to load prop texture for ${prop.id}:`,
								fullUrl,
								err,
							);
							setPropImages((prev) => ({ ...prev, [prop.id]: null }));
						};
					} else {
						newPropImages[prop.id] = null;
					}
				} else {
					newPropImages[prop.id] = null;
				}
			});
			setPropImages(newPropImages);
		} else {
			setPropImages({});
		}

		if (currentRoom?.riddles && currentRoom.riddles.length > 0) {
			const newRiddleImages: Record<string, HTMLImageElement | null> = {};
			currentRoom.riddles.forEach((riddle) => {
				if (riddle.texture) {
					console.log(
						`Loading riddle texture for ${riddle.id}:`,
						riddle.texture,
					);
					const fullUrl = getImageUrl(riddle.texture);
					if (fullUrl) {
						const img = new Image();
						img.src = fullUrl;
						img.onload = () => {
							console.log(`Riddle texture loaded for ${riddle.id}:`, fullUrl);
							setRiddleImages((prev) => ({ ...prev, [riddle.id]: img }));
						};
						img.onerror = (err) => {
							console.error(
								`Failed to load riddle texture for ${riddle.id}:`,
								fullUrl,
								err,
							);
							setRiddleImages((prev) => ({ ...prev, [riddle.id]: null }));
						};
					} else {
						newRiddleImages[riddle.id] = null;
					}
				} else {
					newRiddleImages[riddle.id] = null;
				}
			});
			// Clear riddles that are no longer in the room
			setRiddleImages(newRiddleImages);
		} else {
			setRiddleImages({});
		}
	}, [
		floorTextureUrl,
		currentRoom?.doorTexture,
		doorTextureAsset?.url, // Add this dependency
		currentRoom?.props,
		currentRoom?.riddles,
	]);

	const handleCellAction = (row: number, col: number) => {
		const key = `${row}-${col}`;
		if (selectedRiddle && selectedTool === "riddle") {
			dispatch(
				updateRiddlePosition({
					riddleId: selectedRiddle,
					position: { row, col },
				}),
			);
			return; // Exit the function early
		}

		if (selectedProp && selectedTool === "props") {
			dispatch(
				updatePropPosition({
					propId: selectedProp,
					position: { row, col },
				}),
			);
			return;
		}

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
				dispatch(addDoor({ row, col })); // Save door position in grid coordinates
				break;
			case "startPoint":
				dispatch(setStartingPoint({ row, col })); // Save starting point in grid coordinates
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

		const cells = [];
		for (let row = 0; row < ROOM_HEIGHT; row++) {
			for (let col = 0; col < ROOM_WIDTH; col++) {
				const key = `${row}-${col}`;
				const isActive = currentRoom.grid[key];

				if (isActive) {
					// Only render texture if it exists, otherwise render a simple neutral floor
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
					} else {
						// Simple neutral floor without color - just a light background
						cells.push(
							<Rect
								key={`${key}-floor`}
								x={col * GRID_SIZE}
								y={row * GRID_SIZE}
								width={GRID_SIZE}
								height={GRID_SIZE}
								fill='#e8e8e8' // Light neutral gray
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
		return cells;
	};

	const renderWalls = () => {
		if (!currentRoom || !floorAccepted) {
			return null;
		}

		const wallLines: React.JSX.Element[] = [];
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

		return wallLines;
	};

	const renderDoors = () => {
		if (!currentRoom?.door) {
			return null;
		}

		const door = currentRoom.door;
		const rotation = door.rotation || 0;

		// If we have a door texture, render it
		if (doorTexture) {
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
					fillPatternRotation={rotation}
					stroke='#555'
					strokeWidth={2}
					shadowColor='black'
					shadowBlur={10}
					shadowOffset={{ x: 5, y: 5 }}
					shadowOpacity={0.5}
					shadowForStrokeEnabled={false}
				/>
			);
		}

		// Fallback: render a simple colored door
		return (
			<Rect
				key='door-fallback'
				x={door.col * GRID_SIZE}
				y={door.row * GRID_SIZE}
				width={GRID_SIZE}
				height={GRID_SIZE}
				fill='#8B4513' // Brown color for door
				stroke='#654321'
				strokeWidth={2}
				rotation={rotation}
			/>
		);
	};

	const renderStartingPoint = (user: any) => {
		if (!currentRoom?.startingPoint) {
			return null;
		}

		const { row, col } = currentRoom.startingPoint;

		// Get user avatar colors from Redux or props
		let avatarColors = {
			skin_color: "#FDBCB4",
			hair_color: "#8B4513",
			eye_color: "#4A90E2",
			outfit_color: "#FF6B6B",
		};

		// Try to get user's actual avatar configuration
		if (user?.player_configuration) {
			try {
				if (typeof user.player_configuration === "string") {
					avatarColors = JSON.parse(user.player_configuration).avatar;
				} else {
					avatarColors = user.player_configuration.avatar;
				}
			} catch (e) {
				console.error("Error parsing avatar configuration:", e);
				// Use default colors
			}
		}

		return (
			<AvatarKonvaElements
				colors={avatarColors}
				x={col * GRID_SIZE}
				y={row * GRID_SIZE}
				gridSize={GRID_SIZE}
			/>
		);
	};

	const renderProps = () => {
		if (!currentRoom?.props || currentRoom.props.length === 0) {
			return null;
		}

		return currentRoom.props.map((prop) => {
			const propImage = propImages[prop.id];
			const isSelected = prop.id === selectedProp;

			if (!propImage) {
				return null;
			}

			// Calculate transformations for the IMAGE PATTERN only
			const imageScaleX =
				(GRID_SIZE / propImage.width) * (prop.flipHorizontal ? -1 : 1);
			const imageScaleY =
				(GRID_SIZE / propImage.height) * (prop.flipVertical ? -1 : 1);
			const rotation = prop.rotation || 0;

			// Calculate pattern offset for flipped images
			const patternOffsetX = prop.flipHorizontal ? propImage.width : 0;
			const patternOffsetY = prop.flipVertical ? propImage.height : 0;

			return (
				<Rect
					key={prop.id}
					x={prop.position.col * GRID_SIZE} // Keep position unchanged
					y={prop.position.row * GRID_SIZE} // Keep position unchanged
					width={GRID_SIZE}
					height={GRID_SIZE}
					fillPatternImage={propImage}
					fillPatternScale={{
						x: imageScaleX, // Apply reflection to image scale only
						y: imageScaleY, // Apply reflection to image scale only
					}}
					fillPatternOffset={{
						x: patternOffsetX, // Offset pattern for proper reflection
						y: patternOffsetY, // Offset pattern for proper reflection
					}}
					fillPatternRotation={rotation} // Apply rotation to image only
					stroke={
						isSelected ? "#FF9900" : prop.hasCollider ? "green" : "transparent"
					}
					strokeWidth={isSelected ? 3 : prop.hasCollider ? 2 : 0}
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
			const riddleImage = riddleImages[riddle.id];

			if (riddleImage) {
				return (
					<Rect
						key={riddle.id}
						x={col * GRID_SIZE}
						y={row * GRID_SIZE}
						width={GRID_SIZE}
						height={GRID_SIZE}
						fillPatternImage={riddleImage}
						fillPatternScale={{
							x: GRID_SIZE / riddleImage.width,
							y: GRID_SIZE / riddleImage.height,
						}}
						stroke={isSelected ? "#FF9900" : "#3BCEAC"}
						strokeWidth={isSelected ? 3 : 2}
						cornerRadius={GRID_SIZE / 6}
					/>
				);
			}

			// Fallback: colored marker
			return (
				<React.Fragment key={riddle.id}>
					<Rect
						x={col * GRID_SIZE}
						y={row * GRID_SIZE}
						width={GRID_SIZE}
						height={GRID_SIZE}
						fill='transparent'
					/>
					<Rect
						x={col * GRID_SIZE + GRID_SIZE / 4}
						y={row * GRID_SIZE + GRID_SIZE / 4}
						width={GRID_SIZE / 2}
						height={GRID_SIZE / 2}
						fill={isSelected ? "#FF9900" : "#3BCEAC"}
						cornerRadius={GRID_SIZE / 4}
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
			<Layer>{renderStartingPoint(user)}</Layer>
			<Layer>{renderProps()}</Layer>
			<Layer>{renderRiddles()}</Layer>
		</Stage>
	);
};

export default MainCanvasWrapper;
