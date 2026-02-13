/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import { useAuthorizedApiClient } from "../../../utils/apiHelpers";
import {
	IoClose,
	IoCloudUpload,
	IoPlay,
	IoPause,
	IoTrash,
	IoImage,
	IoMusicalNotes,
} from "react-icons/io5";

interface SaveEscapeRoomModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess?: () => void;
	mode?: "create" | "edit";
}

const SaveEscapeRoomModal: React.FC<SaveEscapeRoomModalProps> = ({
	isOpen,
	onClose,
	onSuccess,
	mode = "create",
}) => {
	const authorizedClient = useAuthorizedApiClient();
	const thumbnailInputRef = useRef<HTMLInputElement>(null);
	const soundtrackInputRef = useRef<HTMLInputElement>(null);
	const audioRef = useRef<HTMLAudioElement>(null);

	const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
	const [soundtrackFile, setSoundtrackFile] = useState<File | null>(null);
	const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
	const [soundtrackPreview, setSoundtrackPreview] = useState<string | null>(
		null,
	);
	const [isPlaying, setIsPlaying] = useState(false);

	const [removeThumbnailFlag, setRemoveThumbnailFlag] = useState(false);
	const [removeSoundtrackFlag, setRemoveSoundtrackFlag] = useState(false);

	const currentEscapeRoom = useSelector((state: RootState) => {
		return state.editor.escapeRooms.find(
			(er) => er.id === state.editor.currentEscapeRoomId,
		);
	});


	const validationSchema = Yup.object({
		name: Yup.string()
			.min(3, "Nazwa musi mieć co najmniej 3 znaki")
			.max(100, "Nazwa nie może przekraczać 100 znaków")
			.required("Nazwa jest wymagana"),
		description: Yup.string()
			.min(10, "Opis musi mieć co najmniej 10 znaków")
			.max(500, "Opis nie może przekraczać 500 znaków")
			.required("Opis jest wymagany"),
	});

	const convertUrlToPath = (url: string | null | undefined): string | null => {
		if (!url) return null;
		if (url.startsWith("/storage/")) return url;
		if (url.startsWith("http")) {
			try {
				const urlObj = new URL(url);
				return urlObj.pathname;
			} catch (error) {
				console.error("Error parsing URL:", error);
				return null;
			}
		}
		return url;
	};

	const validateRiddleType = (type: string): string => {
		const validTypes = [
			"knowledge",
			"math",
			"language",
			"cypher",
			"puzzleGame",
		];
		return validTypes.includes(type) ? type : "knowledge";
	};

	const convertGridToObject = (grid: any): any => {
		if (!grid) return {};
		if (!Array.isArray(grid)) {
			const sanitized: any = {};
			Object.entries(grid).forEach(([key, value]: [string, any]) => {
				if (
					value === "true" ||
					value === true ||
					value === "1" ||
					value === 1
				) {
					sanitized[key] = "1";
				}
			});
			return sanitized;
		}
		const gridObj: any = {};
		grid.forEach((row: any[], rowIndex: number) => {
			if (Array.isArray(row)) {
				row.forEach((cell: any, colIndex: number) => {
					if (cell === "1" || cell === 1 || cell === true) {
						gridObj[`${rowIndex}-${colIndex}`] = "1";
					}
				});
			}
		});
		return gridObj;
	};

	const convertWallsToObject = (walls: any, wallColor: string): any => {
		if (!walls) return { wallColor };

		if (typeof walls === "object" && !Array.isArray(walls)) {
			return walls;
		}

		const wallsObj: any = { wallColor };
		if (Array.isArray(walls)) {
			walls.forEach((wall: any) => {
				if (
					typeof wall === "object" &&
					wall.row !== undefined &&
					wall.col !== undefined
				) {
					wallsObj[`${wall.row}-${wall.col}`] = wallColor;
				} else if (typeof wall === "string" && wall.includes("-")) {
					wallsObj[wall] = wallColor;
				}
			});
		}
		return wallsObj;
	};

	const formik = useFormik({
		initialValues: {
			name: currentEscapeRoom?.metadata?.name || "",
			description: currentEscapeRoom?.metadata?.description || "",
		},
		enableReinitialize: true,
		validationSchema,
		onSubmit: async (values, { setSubmitting, setStatus }) => {
			try {
				if (!currentEscapeRoom) {
					throw new Error("Brak danych Escape Room do zapisania");
				}

				if (!currentEscapeRoom.rooms || currentEscapeRoom.rooms.length === 0) {
					throw new Error("Przynajmniej jeden pokój jest wymagany");
				}

				const roomsExceedingLimit = currentEscapeRoom.rooms.filter(
					(room) => (room.riddles?.length || 0) > 5,
				);

				if (roomsExceedingLimit.length > 0) {
					const roomNumbers = roomsExceedingLimit
						.map(
							(room) =>
								currentEscapeRoom.rooms.findIndex((r) => r === room) + 1,
						)
						.join(", ");
					setStatus({
						type: "error",
						message: `Pokoje ${roomNumbers} przekraczają limit 5 zagadek na pokój.`,
					});
					return;
				}

				const roomsData = currentEscapeRoom.rooms.map((room) => ({
					grid: convertGridToObject(room.grid),
					walls: convertWallsToObject(room.walls, room.wallColor || "#888888"),
					floorColor: room.floorColor,
					wallColor: room.wallColor || "#888888",
					wallThickness: room.wallThickness || 20,
					floorTexture: room.floorTexture,
					floorTextureAssetId: room.floorTextureAssetId || null,
					doorTexture: room.doorTexture,
					doorTextureAssetId: room.doorTextureAssetId || null,
					floorAccepted: room.floorAccepted || false,
					startingPoint: {
						row:
							typeof room.startingPoint?.row === "number"
								? room.startingPoint.row
								: parseInt(room.startingPoint?.row ?? "0", 10) || 0,
						col:
							typeof room.startingPoint?.col === "number"
								? room.startingPoint.col
								: parseInt(room.startingPoint?.col ?? "0", 10) || 0,
					},
					door: room.door
						? room.door.rotation !== undefined && room.door.rotation !== 0
							? {
									row:
										typeof room.door.row === "number"
											? room.door.row
											: parseInt(room.door.row ?? "0", 10) || 0,
									col:
										typeof room.door.col === "number"
											? room.door.col
											: parseInt(room.door.col ?? "0", 10) || 0,
									rotation:
										typeof room.door.rotation === "number"
											? room.door.rotation
											: parseInt(room.door.rotation ?? "0", 10) || 0,
									assetId: (room.door as any).assetId ?? null,
								}
							: {
									row:
										typeof room.door.row === "number"
											? room.door.row
											: parseInt(room.door.row ?? "0", 10) || 0,
									col:
										typeof room.door.col === "number"
											? room.door.col
											: parseInt(room.door.col ?? "0", 10) || 0,
									assetId: (room.door as any).assetId ?? null,
								}
						: { row: 0, col: 0, assetId: null },
					riddles: (room.riddles || [])
						.filter(
							(riddle) => riddle.title && riddle.question && riddle.answer,
						)
						.slice(0, 5)
						.map((riddle) => ({
							id: riddle.id,
							position: {
								row: riddle.position?.row || 0,
								col: riddle.position?.col || 0,
							},
							type: validateRiddleType(riddle.type || "knowledge"),
							data: {
								title: riddle.title || "",
								question: riddle.question || "",
								answer: riddle.answer || "",
								hints: riddle.hints || [],
								options: riddle.options || {},
							},
							assetId: riddle.assetId || null,
							texture: riddle.texture || null,
						})),
					props: (room.props || []).map((prop) => ({
						id: prop.id,
						name: prop.name || "",
						imageUrl: convertUrlToPath(prop.imageUrl),
						assetId: prop.assetId || null,
						position: {
							row: prop.position?.row || 0,
							col: prop.position?.col || 0,
						},
						rotation: prop.rotation || 0,
					})),
				}));

				const endpoint =
					mode === "edit" && currentEscapeRoom.id
						? `/escape-room/${currentEscapeRoom.id.replace("escape-room-", "")}`
						: "/escape-room/";

				if (mode === "edit") {
					const requestData = {
						name: values.name,
						description: values.description,
						rooms: roomsData,
					};

					await authorizedClient.put(endpoint, requestData, {
						headers: {
							"Content-Type": "application/json",
						},
					});

					if (
						thumbnailFile ||
						soundtrackFile ||
						removeThumbnailFlag ||
						removeSoundtrackFlag
					) {
						const fileFormData = new FormData();

						if (thumbnailFile) {
							fileFormData.append("thumbnail", thumbnailFile);
						} else if (removeThumbnailFlag) {
							fileFormData.append("remove_thumbnail", "1");
						}

						if (soundtrackFile) {
							fileFormData.append("soundtrack", soundtrackFile);
						} else if (removeSoundtrackFlag) {
							fileFormData.append("remove_soundtrack", "1");
						}

						await authorizedClient.post(`${endpoint}/files`, fileFormData, {
							headers: {
								"Content-Type": "multipart/form-data",
							},
						});
					}
				} else {
					const formData = new FormData();
					formData.append("name", values.name);
					formData.append("description", values.description);

					if (thumbnailFile) {
						formData.append("thumbnail", thumbnailFile);
					}
					if (soundtrackFile) {
						formData.append("soundtrack", soundtrackFile);
					}

					roomsData.forEach((room: any, roomIndex: number) => {
						if (typeof room.grid === "object" && room.grid !== null) {
							Object.entries(room.grid).forEach(
								([key, value]: [string, any]) => {
									formData.append(
										`rooms[${roomIndex}][grid][${key}]`,
										String(value),
									);
								},
							);
						}

						if (typeof room.walls === "object" && room.walls !== null) {
							Object.entries(room.walls).forEach(
								([key, value]: [string, any]) => {
									formData.append(
										`rooms[${roomIndex}][walls][${key}]`,
										String(value),
									);
								},
							);
						}

						if (typeof room.walls === "object" && room.walls !== null) {
							Object.entries(room.walls).forEach(
								([key, value]: [string, any]) => {
									formData.append(
										`rooms[${roomIndex}][walls][${key}]`,
										String(value),
									);
								},
							);
						}

						formData.append(
							`rooms[${roomIndex}][wallColor]`,
							room.wallColor || "#888888",
						);

						formData.append(
							`rooms[${roomIndex}][wallThickness]`,
							String(room.wallThickness || 16),
						);

						if (room.floorTexture) {
							formData.append(
								`rooms[${roomIndex}][floorTexture]`,
								room.floorTexture,
							);
						}
						if (room.floorTextureAssetId) {
							formData.append(
								`rooms[${roomIndex}][floorTextureAssetId]`,
								String(room.floorTextureAssetId),
							);
						}
						if (room.doorTexture) {
							formData.append(
								`rooms[${roomIndex}][doorTexture]`,
								room.doorTexture,
							);
						}
						if (room.doorTextureAssetId) {
							formData.append(
								`rooms[${roomIndex}][doorTextureAssetId]`,
								String(room.doorTextureAssetId),
							);
						}
						if (room.floorAccepted !== undefined) {
							formData.append(
								`rooms[${roomIndex}][floorAccepted]`,
								room.floorAccepted ? "1" : "0",
							);
						}

						formData.append(
							`rooms[${roomIndex}][startingPoint][row]`,
							String(room.startingPoint.row),
						);
						formData.append(
							`rooms[${roomIndex}][startingPoint][col]`,
							String(room.startingPoint.col),
						);
						formData.append(
							`rooms[${roomIndex}][door][row]`,
							String(parseInt(room.door.row) || 0),
						);
						formData.append(
							`rooms[${roomIndex}][door][col]`,
							String(parseInt(room.door.col) || 0),
						);
						if (room.door.rotation !== undefined) {
							formData.append(
								`rooms[${roomIndex}][door][rotation]`,
								String(room.door.rotation),
							);
						}

						room.riddles?.forEach((riddle: any, riddleIndex: number) => {
							if (riddle.id)
								formData.append(
									`rooms[${roomIndex}][riddles][${riddleIndex}][id]`,
									riddle.id,
								);
							formData.append(
								`rooms[${roomIndex}][riddles][${riddleIndex}][position][row]`,
								String(riddle.position.row),
							);
							formData.append(
								`rooms[${roomIndex}][riddles][${riddleIndex}][position][col]`,
								String(riddle.position.col),
							);
							formData.append(
								`rooms[${roomIndex}][riddles][${riddleIndex}][type]`,
								riddle.type,
							);
							formData.append(
								`rooms[${roomIndex}][riddles][${riddleIndex}][data][title]`,
								riddle.data.title,
							);
							formData.append(
								`rooms[${roomIndex}][riddles][${riddleIndex}][data][question]`,
								riddle.data.question,
							);
							formData.append(
								`rooms[${roomIndex}][riddles][${riddleIndex}][data][answer]`,
								riddle.data.answer,
							);

							riddle.data.hints?.forEach((hint: string, hintIndex: number) => {
								formData.append(
									`rooms[${roomIndex}][riddles][${riddleIndex}][data][hints][${hintIndex}]`,
									hint,
								);
							});

							if (
								riddle.data.options &&
								typeof riddle.data.options === "object"
							) {
								if (Array.isArray(riddle.data.options)) {
									riddle.data.options.forEach(
										(option: any, optionIndex: number) => {
											formData.append(
												`rooms[${roomIndex}][riddles][${riddleIndex}][data][options][${optionIndex}]`,
												String(option),
											);
										},
									);
								} else {
									Object.entries(riddle.data.options).forEach(
										([key, value]) => {
											formData.append(
												`rooms[${roomIndex}][riddles][${riddleIndex}][data][options][${key}]`,
												String(value),
											);
										},
									);
								}
							}

							if (riddle.assetId) {
								formData.append(
									`rooms[${roomIndex}][riddles][${riddleIndex}][assetId]`,
									String(riddle.assetId),
								);
							}
							if (riddle.texture) {
								formData.append(
									`rooms[${roomIndex}][riddles][${riddleIndex}][texture]`,
									riddle.texture,
								);
							}
						});

						room.props?.forEach((prop: any, propIndex: number) => {
							if (prop.id)
								formData.append(
									`rooms[${roomIndex}][props][${propIndex}][id]`,
									prop.id,
								);
							formData.append(
								`rooms[${roomIndex}][props][${propIndex}][name]`,
								prop.name,
							);
							if (prop.imageUrl)
								formData.append(
									`rooms[${roomIndex}][props][${propIndex}][imageUrl]`,
									prop.imageUrl,
								);
							formData.append(
								`rooms[${roomIndex}][props][${propIndex}][assetId]`,
								String(prop.assetId),
							);
							formData.append(
								`rooms[${roomIndex}][props][${propIndex}][position][row]`,
								String(prop.position.row),
							);
							formData.append(
								`rooms[${roomIndex}][props][${propIndex}][position][col]`,
								String(prop.position.col),
							);
							if (prop.rotation !== undefined) {
								formData.append(
									`rooms[${roomIndex}][props][${propIndex}][rotation]`,
									String(prop.rotation),
								);
							}
						});
					});

					await authorizedClient.post(endpoint, formData, {
						headers: {
							"Content-Type": "multipart/form-data",
						},
					});
				}

				setStatus({
					type: "success",
					message:
						mode === "edit"
							? "Escape Room zaktualizowany pomyślnie!"
							: "Escape Room zapisany pomyślnie!",
				});

				setTimeout(() => {
					if (onSuccess) {
						onSuccess();
					}
					window.location.href = "/editor";
				}, 1500);
			} catch (error: any) {
				console.error("=== ERROR SAVING ESCAPE ROOM ===", error);

				let errorMessage = "Błąd podczas zapisywania";
				if (error?.response?.data?.message) {
					errorMessage = error.response.data.message;
				} else if (error?.response?.data?.errors) {
					const errors = error.response.data.errors;
					const firstError = Object.values(errors)[0];
					errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
				} else if (error?.message) {
					errorMessage = error.message;
				}

				setStatus({
					type: "error",
					message: errorMessage,
				});
			} finally {
				setSubmitting(false);
			}
		},
	});

	const handleThumbnailUpload = (file: File) => {
		if (!file) return;
		setThumbnailFile(file);
		const reader = new FileReader();
		reader.onload = (e) => {
			setThumbnailPreview(e.target?.result as string);
		};
		reader.readAsDataURL(file);
	};

	const handleSoundtrackUpload = (file: File) => {
		if (!file) return;
		setSoundtrackFile(file);
		const reader = new FileReader();
		reader.onload = (e) => {
			setSoundtrackPreview(e.target?.result as string);
		};
		reader.readAsDataURL(file);
	};

	const toggleAudioPlayback = () => {
		if (audioRef.current) {
			if (isPlaying) {
				audioRef.current.pause();
			} else {
				audioRef.current.play();
			}
			setIsPlaying(!isPlaying);
		}
	};

	const removeThumbnail = () => {
		setThumbnailFile(null);
		setThumbnailPreview(null);
		setRemoveThumbnailFlag(true);
		if (thumbnailInputRef.current) {
			thumbnailInputRef.current.value = "";
		}
	};

	const removeSoundtrack = () => {
		setSoundtrackFile(null);
		setSoundtrackPreview(null);
		setIsPlaying(false);
		setRemoveSoundtrackFlag(true);
		if (soundtrackInputRef.current) {
			soundtrackInputRef.current.value = "";
		}
	};

	React.useEffect(() => {
		if (isOpen && currentEscapeRoom?.metadata) {
			if (currentEscapeRoom.metadata.thumbnail) {
				setThumbnailPreview(currentEscapeRoom.metadata.thumbnail);
			}
			if (currentEscapeRoom.metadata.soundtrack) {
				setSoundtrackPreview(currentEscapeRoom.metadata.soundtrack);
			}
		}
	}, [isOpen, currentEscapeRoom?.metadata]);

	if (!isOpen) return null;

	const hasValidData =
		currentEscapeRoom &&
		currentEscapeRoom.rooms &&
		currentEscapeRoom.rooms.length > 0;

	const validRiddlesCount =
		currentEscapeRoom?.rooms.reduce((total, room) => {
			return (
				total +
				(room.riddles?.filter(
					(riddle) => riddle.title && riddle.question && riddle.answer,
				).length || 0)
			);
		}, 0) || 0;

	const roomsWithTooManyRiddles =
		currentEscapeRoom?.rooms.filter(
			(room) => (room.riddles?.length || 0) > 5,
		) || [];

	const hasRiddleErrors = roomsWithTooManyRiddles.length > 0;

	const roomsWithInvalidDoor =
		currentEscapeRoom?.rooms.filter(
			(room) => !room.door || (room.door.row === 0 && room.door.col === 0),
		) || [];

	const hasDoorWarnings = roomsWithInvalidDoor.length > 0;

	return (
		<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
			<div className='bg-gray-800 rounded-lg w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col'>
				<div className='flex justify-between items-center p-6 border-b border-gray-700'>
					<h2 className='text-2xl font-bold text-white'>
						{mode === "edit" ? "Edytuj Escape Room" : "Zapisz Escape Room"}
					</h2>
					<button
						onClick={onClose}
						className='text-gray-400 hover:text-white transition-colors'>
						<IoClose size={28} />
					</button>
				</div>

				{!hasValidData && (
					<div className='bg-red-600 text-white p-4 mx-6 mt-6 rounded-lg'>
						<div className='flex items-center'>
							<div className='mr-3'>⚠</div>
							<div>
								Brak wymaganych danych. Upewnij się, że masz utworzony
								przynajmniej jeden pokój.
							</div>
						</div>
					</div>
				)}

				{hasRiddleErrors && (
					<div className='bg-orange-600 text-white p-4 mx-6 mt-6 rounded-lg'>
						<div className='flex items-center'>
							<div className='mr-3'>⚠</div>
							<div>
								<div className='font-semibold mb-1'>
									Przekroczono limit zagadek!
								</div>
								<div className='text-sm'>
									Pokoje{" "}
									{roomsWithTooManyRiddles
										.map(
											(room) =>
												(currentEscapeRoom?.rooms.findIndex(
													(r) => r === room,
												) ?? -1) + 1,
										)
										.join(", ")}{" "}
									mają więcej niż 5 zagadek.
								</div>
							</div>
						</div>
					</div>
				)}

				{hasDoorWarnings && (
					<div className='bg-yellow-600 text-white p-4 mx-6 mt-6 rounded-lg'>
						<div className='flex items-center'>
							<div className='mr-3'>⚠</div>
							<div>
								<div className='font-semibold mb-1'>
									Nieprawidłowa pozycja drzwi!
								</div>
								<div className='text-sm'>
									Pokoje{" "}
									{roomsWithInvalidDoor
										.map(
											(room) =>
												(currentEscapeRoom?.rooms.findIndex(
													(r) => r === room,
												) ?? -1) + 1,
										)
										.join(", ")}{" "}
									mają drzwi na pozycji (0,0).
								</div>
							</div>
						</div>
					</div>
				)}

				<div className='flex-1 overflow-y-auto p-6'>
					<form
						onSubmit={formik.handleSubmit}
						className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
						<div className='space-y-6'>
							<div className='bg-gray-700 p-6 rounded-lg'>
								<h3 className='text-lg font-semibold text-white mb-4'>
									Podstawowe informacje
								</h3>

								<div className='mb-4'>
									<label className='block text-sm font-medium text-gray-300 mb-2'>
										Nazwa * ({formik.values.name.length}/100)
									</label>
									<input
										type='text'
										name='name'
										value={formik.values.name}
										onChange={formik.handleChange}
										onBlur={formik.handleBlur}
										className={`w-full px-4 py-3 bg-gray-600 text-white rounded-lg border-2 transition-colors ${
											formik.touched.name && formik.errors.name
												? "border-red-500"
												: "border-transparent focus:border-mainMint"
										}`}
										placeholder='Wprowadź nazwę escape room'
									/>
									{formik.touched.name && formik.errors.name && (
										<p className='text-red-400 text-sm mt-1'>
											{formik.errors.name}
										</p>
									)}
								</div>

								<div>
									<label className='block text-sm font-medium text-gray-300 mb-2'>
										Opis * ({formik.values.description.length}/500)
									</label>
									<textarea
										name='description'
										value={formik.values.description}
										onChange={formik.handleChange}
										onBlur={formik.handleBlur}
										rows={6}
										className={`w-full px-4 py-3 bg-gray-600 text-white rounded-lg border-2 transition-colors resize-none ${
											formik.touched.description && formik.errors.description
												? "border-red-500"
												: "border-transparent focus:border-mainMint"
										}`}
										placeholder='Wprowadź szczegółowy opis escape room...'
									/>
									{formik.touched.description && formik.errors.description && (
										<p className='text-red-400 text-sm mt-1'>
											{formik.errors.description}
										</p>
									)}
								</div>
							</div>

							<div className='bg-gray-700 p-6 rounded-lg'>
								<h3 className='text-lg font-semibold text-white mb-4'>
									Podsumowanie pokoi
								</h3>
								<div className='space-y-3'>
									<div className='flex justify-between items-center'>
										<span className='text-gray-300'>Liczba pokoi:</span>
										<span className='text-mainMint font-semibold'>
											{currentEscapeRoom?.rooms.length || 0}
										</span>
									</div>

									<div className='bg-gray-600 p-3 rounded'>
										<div className='text-sm text-gray-300 mb-2'>
											Sprawdzenie zagadek:
										</div>
										<div className='flex justify-between items-center text-sm'>
											<span className='text-gray-400'>Kompletne zagadki:</span>
											<span
												className={`font-medium ${
													validRiddlesCount > 0
														? "text-green-400"
														: "text-yellow-400"
												}`}>
												{validRiddlesCount}
											</span>
										</div>
									</div>

									{currentEscapeRoom?.rooms.map((room, index) => {
										const validRiddlesInRoom =
											room.riddles?.filter(
												(riddle) =>
													riddle.title && riddle.question && riddle.answer,
											).length || 0;
										const totalRiddlesInRoom = room.riddles?.length || 0;

										return (
											<div key={room.id} className='bg-gray-600 p-3 rounded'>
												<h4 className='text-white font-medium mb-2'>
													Pokój {index + 1}
												</h4>
												<div className='grid grid-cols-3 gap-4 text-sm'>
													<div className='text-center'>
														<div className='text-gray-400'>Komórki</div>
														<div className='text-white font-medium'>
															{Object.keys(room.grid || {}).length}
														</div>
													</div>
													<div className='text-center'>
														<div className='text-gray-400'>Zagadki</div>
														<div
															className={`font-medium ${
																totalRiddlesInRoom > 5
																	? "text-red-400"
																	: totalRiddlesInRoom === 5
																		? "text-orange-400"
																		: "text-green-400"
															}`}>
															{validRiddlesInRoom}/{totalRiddlesInRoom}
														</div>
													</div>
													<div className='text-center'>
														<div className='text-gray-400'>Przedmioty</div>
														<div className='text-white font-medium'>
															{room.props?.length || 0}
														</div>
													</div>
												</div>
											</div>
										);
									})}
								</div>
							</div>
						</div>

						<div className='space-y-6'>
							<div className='bg-gray-700 p-6 rounded-lg'>
								<h3 className='text-lg font-semibold text-white mb-4 flex items-center'>
									<IoImage className='mr-2' />
									Miniatura
								</h3>

								{thumbnailPreview ? (
									<div className='relative'>
										<img
											src={thumbnailPreview}
											alt='Thumbnail preview'
											className='w-full h-48 object-cover rounded-lg'
										/>
										<button
											type='button'
											onClick={removeThumbnail}
											className='absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-colors'>
											<IoTrash size={16} />
										</button>
									</div>
								) : (
									<div
										onClick={() => thumbnailInputRef.current?.click()}
										className='border-2 border-dashed border-gray-500 rounded-lg p-8 text-center cursor-pointer hover:border-mainMint hover:bg-gray-600 transition-colors'>
										<div className='flex flex-col items-center'>
											<IoCloudUpload size={40} className='text-gray-400 mb-2' />
											<span className='text-gray-300 mb-1'>
												Kliknij aby przesłać miniaturę
											</span>
											<span className='text-gray-500 text-sm'>
												PNG, JPG do 5MB
											</span>
										</div>
									</div>
								)}

								<input
									ref={thumbnailInputRef}
									type='file'
									accept='image/*'
									onChange={(e) => {
										const file = e.target.files?.[0];
										if (file) handleThumbnailUpload(file);
									}}
									className='hidden'
								/>
							</div>

							<div className='bg-gray-700 p-6 rounded-lg'>
								<h3 className='text-lg font-semibold text-white mb-4 flex items-center'>
									<IoMusicalNotes className='mr-2' />
									Ścieżka dźwiękowa
								</h3>

								{soundtrackPreview ? (
									<div className='bg-gray-600 p-4 rounded-lg'>
										<div className='flex items-center justify-between mb-3'>
											<span className='text-white font-medium'>
												Podgląd audio
											</span>
											<button
												type='button'
												onClick={removeSoundtrack}
												className='bg-red-600 hover:bg-red-700 text-white p-1 rounded transition-colors'>
												<IoTrash size={14} />
											</button>
										</div>
										<audio
											ref={audioRef}
											src={soundtrackPreview}
											onEnded={() => setIsPlaying(false)}
											className='hidden'
										/>
										<div className='flex items-center space-x-3'>
											<button
												type='button'
												onClick={toggleAudioPlayback}
												className='bg-mainMint hover:bg-mainMint/80 text-gray-900 p-2 rounded-full transition-colors'>
												{isPlaying ? (
													<IoPause size={16} />
												) : (
													<IoPlay size={16} />
												)}
											</button>
											<span className='text-gray-300 text-sm truncate flex-1'>
												{soundtrackFile?.name || "Istniejący plik audio"}
											</span>
										</div>
									</div>
								) : (
									<div
										onClick={() => soundtrackInputRef.current?.click()}
										className='border-2 border-dashed border-gray-500 rounded-lg p-8 text-center cursor-pointer hover:border-mainMint hover:bg-gray-600 transition-colors'>
										<div className='flex flex-col items-center'>
											<IoCloudUpload size={40} className='text-gray-400 mb-2' />
											<span className='text-gray-300 mb-1'>
												Kliknij aby przesłać muzykę
											</span>
											<span className='text-gray-500 text-sm'>
												MP3, WAV do 10MB
											</span>
										</div>
									</div>
								)}

								<input
									ref={soundtrackInputRef}
									type='file'
									accept='audio/*'
									onChange={(e) => {
										const file = e.target.files?.[0];
										if (file) handleSoundtrackUpload(file);
									}}
									className='hidden'
								/>
							</div>
						</div>
					</form>

					{formik.status && (
						<div
							className={`mt-6 p-4 rounded-lg ${
								formik.status.type === "success"
									? "bg-green-600 text-white"
									: "bg-red-600 text-white"
							}`}>
							<div className='flex items-center'>
								<div className='mr-3'>
									{formik.status.type === "success" ? "✓" : "⚠"}
								</div>
								<div>{formik.status.message}</div>
							</div>
						</div>
					)}
				</div>

				<div className='flex justify-end space-x-4 p-6 border-t border-gray-700 bg-gray-750'>
					<button
						type='button'
						onClick={onClose}
						className='px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium'>
						Anuluj
					</button>

					<button
						type='button'
						onClick={() => formik.handleSubmit()}
						disabled={
							formik.isSubmitting ||
							!formik.isValid ||
							!hasValidData ||
							hasRiddleErrors
						}
						className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
							formik.isSubmitting ||
							!formik.isValid ||
							!hasValidData ||
							hasRiddleErrors
								? "bg-gray-600 text-gray-400 cursor-not-allowed"
								: "bg-mainMint text-gray-900 hover:bg-mainMint/80"
						}`}>
						{formik.isSubmitting ? (
							<div className='flex items-center'>
								<div className='animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2'></div>
								{mode === "edit" ? "Aktualizowanie..." : "Zapisywanie..."}
							</div>
						) : mode === "edit" ? (
							"Zaktualizuj"
						) : (
							"Zapisz"
						)}
					</button>
				</div>
			</div>
		</div>
	);
};

export default SaveEscapeRoomModal;
