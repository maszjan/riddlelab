import React, { useEffect, useState, useRef, useCallback } from "react";
import type { KAPLAYCtx } from "kaplay";
import { GameCanvas } from "./GameCanvas";
import { GameUI } from "./GameUI";
import { GameControls } from "./GameControls";
import { RiddleModal } from "./RiddleModal";
import { GameEndModal } from "./GameEndModal";
import { useGameApi } from "../../../hooks/useGameApi";
import echo from "../../../utils/echo";

interface GameManagerProps {
	escapeRoomId: number;
}

const GRID_SIZE = 40;
const PLAYER_SPEED = 200;

const DEFAULT_AVATAR_COLORS = {
	skin_color: "#ffdbac",
	hair_color: "#654321",
	eye_color: "#1e3a8a",
	outfit_color: "#3b82f6",
};

export const GameManager: React.FC<GameManagerProps> = ({ escapeRoomId }) => {
	const [gameData, setGameData] = useState<any>(null);
	const [currentRoomIndex, setCurrentRoomIndex] = useState(0);
	const [score, setScore] = useState(0);
	const [gameTime, setGameTime] = useState(0);
	const [hints, setHints] = useState(0);
	const [isPaused, setIsPaused] = useState(false);
	const [attemptId, setAttemptId] = useState<number | null>(null);
	const [activeRiddle, setActiveRiddle] = useState<any>(null);
	const [riddleModalOpen, setRiddleModalOpen] = useState(false);
	const [riddleFeedback, setRiddleFeedback] = useState<{
		type: "success" | "error" | "hint";
		message: string;
		pointsEarned?: number;
		attemptsLeft?: number;
	} | null>(null);
	const [solvedRiddles, setSolvedRiddles] = useState<Set<number>>(new Set());
	const [isDoorUnlocked, setIsDoorUnlocked] = useState(false);
	const [gameEndModal, setGameEndModal] = useState<{
		isOpen: boolean;
		status: "won" | "lost" | "abandoned";
	}>({ isOpen: false, status: "abandoned" });

	const gameInstanceRef = useRef<KAPLAYCtx | null>(null);
	const timeIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const nearbyRiddleRef = useRef<any>(null);
	const nearbyDoorRef = useRef<boolean>(false);
	const isPausedRef = useRef(false);
	const riddleModalOpenRef = useRef(false);
	const doorRef = useRef<any>(null);
	const solvedRiddlesRef = useRef<Set<number>>(new Set());
	const movementBlockedRef = useRef(false);
	const lastRoomIndexRef = useRef<number>(-1);
	const savedPlayerPositionRef = useRef<{ x: number; y: number } | null>(null);

	const {
		loading,
		error,
		clearError,
		startAttempt,
		solveRiddle,
		useHint,
		nextRoom,
		updateTime,
		pauseAttempt,
		resumeAttempt,
		abandonAttempt,
		failAttempt,
	} = useGameApi();

	useEffect(() => {
		if (error) {
			const timeout = setTimeout(() => {
				clearError();
			}, 3000);
			return () => clearTimeout(timeout);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [error]);

	useEffect(() => {
		isPausedRef.current = isPaused;
	}, [isPaused]);

	useEffect(() => {
		riddleModalOpenRef.current = riddleModalOpen;
	}, [riddleModalOpen]);

	useEffect(() => {
		solvedRiddlesRef.current = solvedRiddles;
	}, [solvedRiddles]);

	useEffect(() => {
		if (timeIntervalRef.current) {
			clearInterval(timeIntervalRef.current);
			timeIntervalRef.current = null;
		}

		gameInstanceRef.current = null;
		isPausedRef.current = false;
		riddleModalOpenRef.current = false;
		movementBlockedRef.current = false;
		nearbyRiddleRef.current = null;
		nearbyDoorRef.current = false;
		doorRef.current = null;
		lastRoomIndexRef.current = -1;
		savedPlayerPositionRef.current = null;

		setIsPaused(false);
		setRiddleModalOpen(false);
		setRiddleFeedback(null);
		setCurrentRoomIndex(0);
		setIsDoorUnlocked(false);

		const initGame = async () => {
			const data = await startAttempt(escapeRoomId);
			if (data) {
				setGameData(data);
				setAttemptId(data.attempt.id);
				setScore(data.attempt.score);
				setGameTime(data.attempt.time_spent);
				setHints(data.attempt.hints_used);

				const solved = new Set<number>();
				data.rooms.forEach((room: any) => {
					room.riddles.forEach((riddle: any) => {
						if (riddle.solved) {
							solved.add(riddle.id);
						}
					});
				});
				setSolvedRiddles(solved);
			}
		};
		initGame();
	}, [escapeRoomId]);

	useEffect(() => {
		if (!attemptId) return;

		const handleBeforeUnload = (e: BeforeUnloadEvent) => {
			abandonAttempt(attemptId);
			e.preventDefault();
			e.returnValue = "";
		};

		window.addEventListener("beforeunload", handleBeforeUnload);

		return () => {
			window.removeEventListener("beforeunload", handleBeforeUnload);
		};
	}, [attemptId, abandonAttempt]);

	useEffect(() => {
		if (!attemptId) return;

		const channel = echo.channel(`attempt.${attemptId}`);

		channel.listen(".attempt.updated", (event: any) => {
			if (event.action === "riddle_solved") {
				setScore(event.attempt.score);
				setSolvedRiddles((prev) => new Set(prev).add(event.payload.riddle_id));
			} else if (event.action === "hint_used") {
				setHints(event.attempt.hints_used);
			} else if (event.action === "room_changed") {
				setCurrentRoomIndex((prev) => prev + 1);
				setSolvedRiddles(new Set());
				setIsDoorUnlocked(false);

				nearbyRiddleRef.current = null;
				nearbyDoorRef.current = false;
				setRiddleModalOpen(false);
				setRiddleFeedback(null);
				savedPlayerPositionRef.current = null;
			} else if (event.action === "game_completed") {
				if (gameInstanceRef.current) {
					gameInstanceRef.current.debug.paused = true;
				}
				setIsPaused(true);
				setGameEndModal({ isOpen: true, status: "won" });
			}
		});

		return () => {
			echo.leaveChannel(`attempt.${attemptId}`);
		};
	}, [attemptId]);

	useEffect(() => {
		if (!gameData || !gameData.rooms[currentRoomIndex]) return;

		const currentRoom = gameData.rooms[currentRoomIndex];
		const totalRiddles = currentRoom.riddles?.length || 0;

		if (totalRiddles > 0 && solvedRiddles.size >= totalRiddles) {
			setIsDoorUnlocked(true);
			if (doorRef.current) {
				doorRef.current.unlocked = true;
			}
		}
	}, [solvedRiddles, gameData, currentRoomIndex]);

	useEffect(() => {
		if (isPaused || !attemptId) return;

		timeIntervalRef.current = setInterval(() => {
			setGameTime((prev) => {
				const newTime = prev + 1;
				if (newTime % 5 === 0) {
					updateTime(attemptId, newTime);
				}
				return newTime;
			});
		}, 1000);

		return () => {
			if (timeIntervalRef.current) {
				clearInterval(timeIntervalRef.current);
			}
		};
	}, [isPaused, attemptId]);

	const handlePause = useCallback(async () => {
		if (!attemptId) return;

		if (gameInstanceRef.current) {
			gameInstanceRef.current.debug.paused = true;
		}

		setIsPaused(true);
		await pauseAttempt(attemptId);
	}, [attemptId, pauseAttempt]);

	const handleResume = useCallback(async () => {
		if (!attemptId) return;

		if (gameInstanceRef.current) {
			gameInstanceRef.current.debug.paused = false;
		}

		setIsPaused(false);
		await resumeAttempt(attemptId);
	}, [attemptId, resumeAttempt]);

	const handleQuit = useCallback(() => {
		if (attemptId) {
			abandonAttempt(attemptId);
		}

		if (gameInstanceRef.current) {
			gameInstanceRef.current.debug.paused = true;
		}
		setIsPaused(true);
		setGameEndModal({ isOpen: true, status: "abandoned" });
	}, [attemptId, abandonAttempt]);

	const handleInteract = useCallback(async () => {
		if (!attemptId) return;

		if (gameInstanceRef.current) {
			try {
				const player = gameInstanceRef.current.get("player")[0];
				if (player && player.pos) {
					savedPlayerPositionRef.current = {
						x: player.pos.x,
						y: player.pos.y,
					};
				}
			} catch (e) {
				console.warn("Failed to save player position:", e);
			}
		}

		if (nearbyDoorRef.current) {
			if (isDoorUnlocked) {
				await nextRoom(attemptId);
			} else {
				console.log("Door is locked! Solve all riddles first.");
			}
			return;
		}

		if (!nearbyRiddleRef.current) {
			console.log("No nearby riddle or door!");
			return;
		}

		setActiveRiddle(nearbyRiddleRef.current);
		setRiddleModalOpen(true);
		setRiddleFeedback(null);
	}, [attemptId, isDoorUnlocked, nextRoom]);

	const handleRiddleSubmit = useCallback(
		async (answer: string) => {
			if (!attemptId || !activeRiddle) return;

			const riddle = activeRiddle;

			try {
				const result = await solveRiddle(attemptId, {
					riddle_id: riddle.id,
					answer,
				});

				const msg = result?.message || "";
				const isMaxAttempts =
					msg.toLowerCase().includes("max attempts") ||
					msg.toLowerCase().includes("limit") ||
					msg.toLowerCase().includes("prób");

				if (result?.success) {
					setRiddleFeedback({
						type: "success",
						message: "Poprawnie! Świetna robota!",
						pointsEarned: result.points_earned,
					});
					setSolvedRiddles((prev) => new Set(prev).add(riddle.id));
					setTimeout(() => {
						setRiddleModalOpen(false);
						setRiddleFeedback(null);
					}, 2000);
				} else {
					setRiddleFeedback({
						type: "error",
						message: msg,
						attemptsLeft: result?.attempts_left,
					});

					if (isMaxAttempts || result?.attempts_left === 0) {
						setRiddleModalOpen(false);
						setRiddleFeedback(null);
						nearbyRiddleRef.current = null;

						if (gameInstanceRef.current) {
							gameInstanceRef.current.debug.paused = true;
						}
						setIsPaused(true);

						if (attemptId) {
							await failAttempt(attemptId);
						}

						setGameEndModal({ isOpen: true, status: "lost" });
					} else {
						console.log(
							"Riddle submit - still attempts left, modal should stay open",
						);
					}
				}
			} catch (err) {
				setRiddleFeedback({
					type: "error",
					message: "Wystąpił błąd. Spróbuj ponownie.",
				});
			}
		},
		[
			attemptId,
			solveRiddle,
			score,
			riddleModalOpen,
			riddleFeedback,
			activeRiddle,
			failAttempt,
		],
	);

	const handleRiddleHint = useCallback(async () => {
		if (!attemptId || !nearbyRiddleRef.current) return;

		const riddle = nearbyRiddleRef.current;

		if (riddle.hint_used) {
			setRiddleFeedback({
				type: "error",
				message: "Podpowiedź już została użyta dla tej zagadki!",
			});
			return;
		}

		try {
			const hintData = await useHint(attemptId, riddle.id);

			if (hintData && hintData.hint) {
				setRiddleFeedback({
					type: "hint",
					message: `Podpowiedź: ${hintData.hint}`,
				});

				riddle.hint_used = true;
			} else if (hintData?.message) {
				setRiddleFeedback({
					type: "error",
					message: hintData.message,
				});
			}
		} catch (err) {
			setRiddleFeedback({
				type: "error",
				message: "Nie można pobrać podpowiedzi. Spróbuj ponownie.",
			});
		}
	}, [attemptId, useHint]);

	const handleRiddleClose = useCallback(() => {
		const attemptsLeft = riddleFeedback?.attemptsLeft;
		const isMaxAttempts =
			riddleFeedback?.message?.toLowerCase().includes("max attempts") ||
			riddleFeedback?.message?.toLowerCase().includes("limit") ||
			riddleFeedback?.message?.toLowerCase().includes("prób");

		setRiddleModalOpen(false);
		setRiddleFeedback(null);
		setActiveRiddle(null);

		if (isMaxAttempts || attemptsLeft === 0) {
			nearbyRiddleRef.current = null;
		}
	}, [riddleFeedback]);

	const handleGameInstanceReady = useCallback(
		(k: KAPLAYCtx) => {
			if (
				gameInstanceRef.current &&
				k === gameInstanceRef.current &&
				lastRoomIndexRef.current === currentRoomIndex
			) {
				console.log("Same game instance and same room, skipping setup");
				return;
			}

			if (gameInstanceRef.current && k !== gameInstanceRef.current) {
				console.log("New Kaplay instance detected, will setup scene");
			}

			if (!gameData) {
				console.log("No game data yet, skipping setup");
				return;
			}

			gameInstanceRef.current = k;
			lastRoomIndexRef.current = currentRoomIndex;

			const currentRoom = gameData.rooms[currentRoomIndex];

			if (!currentRoom) {
				console.error("No room data!");
				return;
			}

			try {
				k.go("__temp__");
			} catch (e) {
				k.scene("__temp__", () => {});
				k.go("__temp__");
			}

			setupGameScene(k, currentRoom, gameData.playerConfig);
		},
		[gameData, currentRoomIndex],
	);

	const setupGameScene = (
		k: KAPLAYCtx,
		currentRoom: any,
		playerConfig: any,
	) => {
		const getImageUrl = (url: string | null): string | null => {
			if (!url) return null;
			if (url.startsWith("http")) return url;

			let path = url;
			if (path.startsWith("/storage/")) path = path.substring(9);
			else if (path.startsWith("storage/")) path = path.substring(8);
			else if (path.startsWith("/")) path = path.substring(1);

			return `${import.meta.env.VITE_API_URL}/api/v1/img/${path}`;
		};

		const loadPromises: Promise<any>[] = [];
		let floorTextureLoaded = false;
		let doorTextureLoaded = false;

		if (currentRoom.floor_texture_url) {
			const floorUrl = getImageUrl(currentRoom.floor_texture_url);
			if (floorUrl) {
				loadPromises.push(
					Promise.resolve(k.loadSprite("floor-texture", floorUrl))
						.then(() => {
							floorTextureLoaded = true;
						})
						.catch((err) => {
							console.error("Failed to load floor texture:", err);
						}),
				);
			}
		}

		if (currentRoom.door_texture_url) {
			const doorUrl = getImageUrl(currentRoom.door_texture_url);
			if (doorUrl) {
				loadPromises.push(
					Promise.resolve(k.loadSprite("door-texture", doorUrl))
						.then(() => {
							doorTextureLoaded = true;
						})
						.catch((err) => {
							console.error("Failed to load door texture:", err);
						}),
				);
			}
		}

		currentRoom.assets?.forEach((asset: any) => {
			if (asset.image_url) {
				const url = getImageUrl(asset.image_url);
				if (url) {
					loadPromises.push(
						Promise.resolve(k.loadSprite(`asset-${asset.id}`, url)).catch(
							(err) => {
								console.error(`Failed to load asset ${asset.id}:`, err);
							},
						),
					);
				}
			}
		});

		currentRoom.assets?.forEach((asset: any) => {
			if (!asset.image_url) return;

			try {
				const assetSprite = k.getSprite(`asset-${asset.id}`);
				const assetSpriteWidth = (assetSprite as any)?.width || 64;
				const assetSpriteHeight = (assetSprite as any)?.height || 64;

				let scaleX = GRID_SIZE / assetSpriteWidth;
				let scaleY = GRID_SIZE / assetSpriteHeight;

				if (asset.flip_horizontal) scaleX *= -1;
				if (asset.flip_vertical) scaleY *= -1;

				k.add([
					k.sprite(`asset-${asset.id}`),
					k.pos(asset.position.col * GRID_SIZE, asset.position.row * GRID_SIZE),
					k.scale(scaleX, scaleY),
					k.rotate(asset.rotation || 0),
					k.z(6),

					"asset",
					{ gridPos: asset.position },
				]);
			} catch (err) {
				console.error(`Failed to render asset ${asset.id}:`, err);
			}
		});

		k.scene("play", () => {
			let minRow = Infinity,
				maxRow = -Infinity;
			let minCol = Infinity,
				maxCol = -Infinity;

			Object.entries(currentRoom.grid_data || {}).forEach(([key, value]) => {
				if (value === "1" || value === 1) {
					const [row, col] = key.split("-").map(Number);
					minRow = Math.min(minRow, row);
					maxRow = Math.max(maxRow, row);
					minCol = Math.min(minCol, col);
					maxCol = Math.max(maxCol, col);
				}
			});

			const mapWidth = (maxCol - minCol + 1) * GRID_SIZE;
			const mapHeight = (maxRow - minRow + 1) * GRID_SIZE;
			const mapCenterX = ((minCol + maxCol) / 2 + 0.5) * GRID_SIZE;
			const mapCenterY = ((minRow + maxRow) / 2 + 0.5) * GRID_SIZE;

			if (currentRoom.wall_color) {
				const borderColor = k.Color.fromHex(currentRoom.wall_color);
				const bgColor = k.rgb(
					borderColor.r * 0.2,
					borderColor.g * 0.2,
					borderColor.b * 0.2,
				);
				k.setBackground(bgColor);
			}

			if (currentRoom.grid_data && floorTextureLoaded) {
				Object.keys(currentRoom.grid_data).forEach((key) => {
					const [row, col] = key.split("-").map(Number);

					const sprite = k.getSprite("floor-texture");
					const spriteWidth = (sprite as any)?.width || 64;
					const spriteHeight = (sprite as any)?.height || 64;

					const scaleX = GRID_SIZE / spriteWidth;
					const scaleY = GRID_SIZE / spriteHeight;

					k.add([
						k.sprite("floor-texture"),
						k.pos(col * GRID_SIZE, row * GRID_SIZE),
						k.scale(scaleX, scaleY),
						k.z(0),
						"floor",
					]);
				});
			}

			const wallThickness = currentRoom.wall_thickness || 10;
			const wallColor = k.Color.fromHex(currentRoom.wall_color || "#333333");

			if (currentRoom.walls_data) {
				const isActive = (r: number, c: number) =>
					!!currentRoom.grid_data?.[`${r}-${c}`];

				Object.keys(currentRoom.grid_data || {}).forEach((key) => {
					const [row, col] = key.split("-").map(Number);

					if (!isActive(row - 1, col)) {
						k.add([
							k.rect(GRID_SIZE, wallThickness),
							k.pos(col * GRID_SIZE, row * GRID_SIZE - wallThickness / 2),
							k.color(wallColor),
							k.z(2),
							"wall",
						]);
					}

					if (!isActive(row + 1, col)) {
						k.add([
							k.rect(GRID_SIZE, wallThickness),
							k.pos(col * GRID_SIZE, (row + 1) * GRID_SIZE - wallThickness / 2),
							k.color(wallColor),
							k.z(4),
							"wall",
						]);
					}
					if (!isActive(row, col - 1)) {
						k.add([
							k.rect(wallThickness, GRID_SIZE),
							k.pos(col * GRID_SIZE - wallThickness / 2, row * GRID_SIZE),
							k.color(wallColor),
							k.z(4),
							"wall",
						]);
					}
					if (!isActive(row, col + 1)) {
						k.add([
							k.rect(wallThickness, GRID_SIZE),
							k.pos((col + 1) * GRID_SIZE - wallThickness / 2, row * GRID_SIZE),
							k.color(wallColor),
							k.z(4),
							"wall",
						]);
					}
				});
			}

			if (currentRoom.door_position && doorTextureLoaded) {
				const doorSprite = k.getSprite("door-texture");
				const doorSpriteWidth = (doorSprite as any)?.width || 64;
				const doorSpriteHeight = (doorSprite as any)?.height || 64;

				const doorScaleX = GRID_SIZE / doorSpriteWidth;
				const doorScaleY = GRID_SIZE / doorSpriteHeight;

				const door = k.add([
					k.sprite("door-texture"),
					k.pos(
						(currentRoom.door_position.col + 0.5) * GRID_SIZE,
						(currentRoom.door_position.row + 0.5) * GRID_SIZE,
					),
					k.anchor("center"),
					k.scale(doorScaleX, doorScaleY),
					k.rotate(currentRoom.door_position.rotation || 0),
					k.z(7),
					"door",
					{
						gridPos: currentRoom.door_position,
						unlocked: isDoorUnlocked,
					},
				]);

				doorRef.current = door;

				const doorGlow = k.add([
					k.circle(GRID_SIZE * 0.5),
					k.pos(
						(currentRoom.door_position.col + 0.5) * GRID_SIZE,
						(currentRoom.door_position.row + 0.5) * GRID_SIZE,
					),
					k.anchor("center"),
					k.color(34, 197, 94),
					k.opacity(0),
					k.z(6),
					"door-glow",
				]);

				doorGlow.onUpdate(() => {
					if (door.unlocked) {
						doorGlow.opacity = 0.3 + Math.sin(k.time() * 3) * 0.2;
					} else {
						doorGlow.opacity = 0;
					}
				});
			}

			currentRoom.assets?.forEach((asset: any) => {
				if (!asset.image_url) return;

				if (
					asset.type === "door" &&
					currentRoom.door_position &&
					currentRoom.door_texture_url &&
					asset.image_url === currentRoom.door_texture_url &&
					asset.position?.row === currentRoom.door_position.row &&
					asset.position?.col === currentRoom.door_position.col
				) {
					return;
				}

				const assetSprite = k.getSprite(`asset-${asset.id}`);
				const assetSpriteWidth = (assetSprite as any)?.width || 64;
				const assetSpriteHeight = (assetSprite as any)?.height || 64;

				let scaleX = GRID_SIZE / assetSpriteWidth;
				let scaleY = GRID_SIZE / assetSpriteHeight;

				if (asset.flip_horizontal) scaleX *= -1;
				if (asset.flip_vertical) scaleY *= -1;

				const components = [
					k.sprite(`asset-${asset.id}`),
					k.pos(asset.position.col * GRID_SIZE, asset.position.row * GRID_SIZE),
					k.scale(scaleX, scaleY),
					k.rotate(asset.rotation || 0),
					k.z(4),
					"asset",
					{ gridPos: asset.position },
				];

				if (asset.type === "prop" || asset.type === "door") {
					components.splice(3, 0, k.anchor("center") as any);
				}

				k.add(components);
			});

			currentRoom.riddles?.forEach((riddle: any, index: number) => {
				if (!riddle.position) return;

				const isSolved = solvedRiddles.has(riddle.id);
				const riddleColor = isSolved ? k.rgb(34, 197, 94) : k.rgb(59, 206, 172);

				const glowZ = 3;
				const circleZ = 4;

				const riddleGlow = k.add([
					k.circle(GRID_SIZE * 0.5),
					k.pos(
						(riddle.position.col + 0.5) * GRID_SIZE,
						(riddle.position.row + 0.5) * GRID_SIZE,
					),
					k.anchor("center"),
					k.color(59, 206, 172),
					k.opacity(isSolved ? 0 : 0.3),
					k.z(glowZ),
					"riddle-glow",
				]);
				riddleGlow.onUpdate(() => {
					if (!solvedRiddlesRef.current.has(riddle.id)) {
						riddleGlow.opacity = 0.3 + Math.sin(k.time() * 3 + index) * 0.2;
					} else {
						riddleGlow.opacity = 0;
					}
				});

				const riddleCircle = k.add([
					k.circle(GRID_SIZE * 0.35),
					k.pos(
						(riddle.position.col + 0.5) * GRID_SIZE,
						(riddle.position.row + 0.5) * GRID_SIZE,
					),
					k.anchor("center"),
					k.color(riddleColor),
					k.opacity(isSolved ? 0 : 0.7),
					k.z(circleZ),
					"riddle",
					{
						riddleData: riddle,
						riddleId: riddle.id,
						solved: isSolved,
					},
				]);

				riddleCircle.onUpdate(() => {
					const currentlySolved = solvedRiddlesRef.current.has(
						riddleCircle.riddleId,
					);
					if (currentlySolved !== riddleCircle.solved) {
						riddleCircle.solved = currentlySolved;
						riddleCircle.color = currentlySolved
							? k.rgb(34, 197, 94)
							: k.rgb(59, 206, 172);
					}

					if (!riddleCircle.solved) {
						riddleCircle.opacity = 0.5 + Math.sin(k.time() * 3 + index) * 0.3;
					} else {
						riddleCircle.opacity = 0;
					}
				});
			});

			let avatarColors = DEFAULT_AVATAR_COLORS;
			if (playerConfig) {
				try {
					const config =
						typeof playerConfig === "string"
							? JSON.parse(playerConfig)
							: playerConfig;
					if (config?.avatar) {
						avatarColors = config.avatar;
					}
				} catch (err) {
					console.error("Failed to parse playerConfig:", err);
				}
			}

			let playerX, playerY;
			if (savedPlayerPositionRef.current) {
				playerX = savedPlayerPositionRef.current.x;
				playerY = savedPlayerPositionRef.current.y;

				savedPlayerPositionRef.current = null;
			} else {
				const startPos = currentRoom.starting_point || {
					row: Math.floor((minRow + maxRow) / 2),
					col: Math.floor((minCol + maxCol) / 2),
				};
				playerX = (startPos.col + 0.5) * GRID_SIZE;
				playerY = (startPos.row + 0.5) * GRID_SIZE;
			}

			const player = k.add([
				k.pos(playerX, playerY),
				k.anchor("center"),
				k.z(10),
				"player",
				{
					colors: avatarColors,
					speed: PLAYER_SPEED,
					mapBounds: { minRow, maxRow, minCol, maxCol },
				},
			]);

			player.onDraw(() => {
				const scale = GRID_SIZE / 80;
				const colors = player.colors;

				k.drawCircle({
					pos: k.vec2(0, -6 * scale),
					radius: 18 * scale,
					color: k.Color.fromHex(colors.skin_color),
				});

				k.drawRect({
					pos: k.vec2(-18 * scale, -24 * scale),
					width: 36 * scale,
					height: 15 * scale,
					radius: [8 * scale, 8 * scale, 0, 0],
					color: k.Color.fromHex(colors.hair_color),
				});

				k.drawCircle({
					pos: k.vec2(-6 * scale, -6 * scale),
					radius: 4 * scale,
					color: k.Color.fromHex("#ffffff"),
				});
				k.drawCircle({
					pos: k.vec2(6 * scale, -6 * scale),
					radius: 4 * scale,
					color: k.Color.fromHex("#ffffff"),
				});

				k.drawCircle({
					pos: k.vec2(-6 * scale, -6 * scale),
					radius: 2 * scale,
					color: k.Color.fromHex(colors.eye_color),
				});
				k.drawCircle({
					pos: k.vec2(6 * scale, -6 * scale),
					radius: 2 * scale,
					color: k.Color.fromHex(colors.eye_color),
				});

				k.drawLine({
					p1: k.vec2(-8 * scale, 4 * scale),
					p2: k.vec2(8 * scale, 4 * scale),
					width: 1.5 * scale,
					color: k.Color.fromHex("#d63031"),
				});

				k.drawRect({
					pos: k.vec2(-10 * scale, 10 * scale),
					width: 20 * scale,
					height: 15 * scale,
					radius: [0, 0, 4 * scale, 4 * scale],
					color: k.Color.fromHex(colors.outfit_color),
				});
			});

			const screenWidth = k.width();
			const screenHeight = k.height();
			const scaleX = screenWidth / (mapWidth + GRID_SIZE * 2);
			const scaleY = screenHeight / (mapHeight + GRID_SIZE * 2);
			const optimalScale = Math.min(scaleX, scaleY) * 0.9;

			k.setCamScale(optimalScale, optimalScale);
			k.setCamPos(mapCenterX, mapCenterY);

			player.onUpdate(() => {
				const playerGridRow = Math.floor(player.pos.y / GRID_SIZE);
				const playerGridCol = Math.floor(player.pos.x / GRID_SIZE);
				const gridKey = `${playerGridRow}-${playerGridCol}`;

				if (
					playerGridRow < minRow ||
					playerGridRow > maxRow ||
					playerGridCol < minCol ||
					playerGridCol > maxCol
				) {
					player.pos = (player as any).lastValidPos.clone();
					return;
				}

				if (!currentRoom.grid_data[gridKey]) {
					player.pos = (player as any).lastValidPos.clone();
					return;
				}

				const wallThickness = currentRoom.wall_thickness || 16;
				const safeDistance = wallThickness + GRID_SIZE * 0.2;
				const isNeighborActive = (r: number, c: number) => {
					const key = `${r}-${c}`;
					return !!currentRoom.grid_data[key];
				};

				if (
					!isNeighborActive(playerGridRow - 1, playerGridCol) &&
					player.pos.y < playerGridRow * GRID_SIZE + safeDistance
				) {
					player.pos.y = playerGridRow * GRID_SIZE + safeDistance;
				}

				if (
					!isNeighborActive(playerGridRow + 1, playerGridCol) &&
					player.pos.y > (playerGridRow + 1) * GRID_SIZE - safeDistance
				) {
					player.pos.y = (playerGridRow + 1) * GRID_SIZE - safeDistance;
				}

				if (
					!isNeighborActive(playerGridRow, playerGridCol - 1) &&
					player.pos.x < playerGridCol * GRID_SIZE + safeDistance
				) {
					player.pos.x = playerGridCol * GRID_SIZE + safeDistance;
				}

				if (
					!isNeighborActive(playerGridRow, playerGridCol + 1) &&
					player.pos.x > (playerGridCol + 1) * GRID_SIZE - safeDistance
				) {
					player.pos.x = (playerGridCol + 1) * GRID_SIZE - safeDistance;
				}

				(player as any).lastValidPos = player.pos.clone();

				if (currentRoom.door_position) {
					const doorGridRow = currentRoom.door_position.row;
					const doorGridCol = currentRoom.door_position.col;
					nearbyDoorRef.current =
						playerGridRow === doorGridRow && playerGridCol === doorGridCol;
				}

				const camTarget = player.pos;
				const camCurrent = k.getCamPos();
				const smoothness = 0.1;
				k.setCamPos(
					camCurrent.x + (camTarget.x - camCurrent.x) * smoothness,
					camCurrent.y + (camTarget.y - camCurrent.y) * smoothness,
				);

				const allRiddles = k.get("riddle");
				const nearbyRiddles = allRiddles.filter((r: any) => {
					const dx = r.pos.x - player.pos.x;
					const dy = r.pos.y - player.pos.y;
					const distance = Math.sqrt(dx * dx + dy * dy);
					return distance < GRID_SIZE * 2.5 && !r.solved;
				});

				nearbyRiddleRef.current = nearbyRiddles[0]?.riddleData || null;
			});

			k.onKeyDown("w", () => {
				if (
					!isPausedRef.current &&
					!riddleModalOpenRef.current &&
					!movementBlockedRef.current
				) {
					player.pos.y -= player.speed * k.dt();
				}
			});
			k.onKeyDown("up", () => {
				if (
					!isPausedRef.current &&
					!riddleModalOpenRef.current &&
					!movementBlockedRef.current
				) {
					player.pos.y -= player.speed * k.dt();
				}
			});
			k.onKeyDown("s", () => {
				if (
					!isPausedRef.current &&
					!riddleModalOpenRef.current &&
					!movementBlockedRef.current
				) {
					player.pos.y += player.speed * k.dt();
				}
			});
			k.onKeyDown("down", () => {
				if (
					!isPausedRef.current &&
					!riddleModalOpenRef.current &&
					!movementBlockedRef.current
				) {
					player.pos.y += player.speed * k.dt();
				}
			});
			k.onKeyDown("a", () => {
				if (
					!isPausedRef.current &&
					!riddleModalOpenRef.current &&
					!movementBlockedRef.current
				) {
					player.pos.x -= player.speed * k.dt();
				}
			});
			k.onKeyDown("left", () => {
				if (
					!isPausedRef.current &&
					!riddleModalOpenRef.current &&
					!movementBlockedRef.current
				) {
					player.pos.x -= player.speed * k.dt();
				}
			});
			k.onKeyDown("d", () => {
				if (
					!isPausedRef.current &&
					!riddleModalOpenRef.current &&
					!movementBlockedRef.current
				) {
					player.pos.x += player.speed * k.dt();
				}
			});
			k.onKeyDown("right", () => {
				if (
					!isPausedRef.current &&
					!riddleModalOpenRef.current &&
					!movementBlockedRef.current
				) {
					player.pos.x += player.speed * k.dt();
				}
			});
		});

		Promise.all(loadPromises)
			.then(() => {
				k.go("play");
			})
			.catch((err) => {
				console.error("Error loading assets:", err);
				k.go("play");
			});
	};

	if (loading || !gameData) {
		return (
			<div className='w-full h-full flex items-center justify-center bg-gray-900'>
				<p className='text-white text-xl'>Ładowanie gry...</p>
			</div>
		);
	}

	function translateRiddleMessage(msg: string): string {
		const lower = msg.toLowerCase();
		if (lower.includes("incorrect answer") || lower.includes("incorrect")) {
			return "Błędna odpowiedź. Spróbuj ponownie!";
		}
		if (lower.includes("max attempts")) {
			return "Wykorzystano maksymalną liczbę prób!";
		}
		if (lower.includes("already solved")) {
			return "Ta zagadka została już rozwiązana!";
		}
		return msg;
	}

	return (
		<div className='relative w-full h-full'>
			{error && (
				<div className='absolute top-4 left-1/2 -translate-x-1/2 bg-red-700 text-white px-6 py-2 rounded-lg shadow-lg z-[200] flex items-center gap-4'>
					<span>Błąd: {translateRiddleMessage(error)}</span>
					<button
						onClick={clearError}
						className='ml-2 text-white hover:text-gray-300 text-xl font-bold focus:outline-none'
						aria-label='Zamknij'>
						&times;
					</button>
				</div>
			)}
			<GameCanvas onGameInstanceReady={handleGameInstanceReady} />
			<GameUI
				score={score}
				time={gameTime}
				hints={hints}
				currentRoomIndex={currentRoomIndex}
				totalRooms={gameData.rooms.length}
				isPaused={isPaused}
				onPause={handlePause}
				onResume={handleResume}
				onQuit={handleQuit}
			/>
			<GameControls
				onPause={handlePause}
				onInteract={handleInteract}
				isPaused={isPaused}
				riddleModalOpen={riddleModalOpen}
			/>
			{activeRiddle && (
				<RiddleModal
					riddle={activeRiddle}
					isOpen={riddleModalOpen}
					attemptId={attemptId ?? undefined}
					onSubmit={handleRiddleSubmit}
					onClose={handleRiddleClose}
					onHint={handleRiddleHint}
					feedback={riddleFeedback}
				/>
			)}
			<GameEndModal
				isOpen={gameEndModal.isOpen}
				status={gameEndModal.status}
				finalScore={score}
				timeSpent={gameTime}
				hintsUsed={hints}
				escapeRoomName={gameData?.escapeRoom?.name || "Escape Room"}
			/>
		</div>
	);
};
