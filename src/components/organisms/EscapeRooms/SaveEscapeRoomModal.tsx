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
	onSaveAndExit?: () => void;
	mode?: "create" | "edit";
}

const SaveEscapeRoomModal: React.FC<SaveEscapeRoomModalProps> = ({
	isOpen,
	onClose,
	onSuccess,
	// onSaveAndExit, // Commented out to avoid unused parameter error
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

	// Helper function to convert URL to relative path
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

	// Helper function to ensure riddle type is valid
	const validateRiddleType = (type: string): string => {
		const validTypes = ["knowledge", "math", "logic", "pattern", "word_puzzle"];
		return validTypes.includes(type) ? type : "knowledge";
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
				console.log("=== STARTING FORM SUBMISSION ===");
				console.log("Mode:", mode);
				console.log("Current Escape Room:", currentEscapeRoom);

				if (!currentEscapeRoom) {
					throw new Error("Brak danych Escape Room do zapisania");
				}

				if (!currentEscapeRoom.rooms || currentEscapeRoom.rooms.length === 0) {
					throw new Error("Przynajmniej jeden pokój jest wymagany");
				}

				console.log("Rooms count:", currentEscapeRoom.rooms.length);

				// Check for rooms exceeding riddle limit
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
						message: `Pokoje ${roomNumbers} przekraczają limit 5 zagadek na pokój. Usuń nadmiarowe zagadki przed zapisaniem.`,
					});
					return;
				}

				// Transform the escape room data with proper validation
				const roomsData = currentEscapeRoom.rooms.map((room) => ({
					grid: room.grid || {},
					walls: room.walls || {},
					floorColor: room.floorColor,
					wallColor: room.wallColor || "#272626",
					wallThickness: room.wallThickness || 20,
					floorTexture: room.floorTexture,
					floorTextureAssetId: room.floorTextureAssetId || null,
					doorTexture: room.doorTexture,
					doorTextureAssetId: room.doorTextureAssetId || null,
					floorAccepted: room.floorAccepted || false,
					startingPoint: room.startingPoint || { row: 0, col: 0 },
					door: room.door || { row: 0, col: 0, rotation: 0 },
					riddles: (room.riddles || [])
						.filter((riddle) => {
							// Only include riddles with required fields
							return riddle.title && riddle.question && riddle.answer;
						})
						.slice(0, 5) // Enforce maximum 5 riddles per room
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
						hasCollider: prop.hasCollider || false,
					})),
				}));

				console.log("Transformed rooms data:", roomsData);

				// Determine the API endpoint based on mode
				const endpoint =
					mode === "edit" && currentEscapeRoom.id
						? `/escape-room/${currentEscapeRoom.id.replace("escape-room-", "")}`
						: "/escape-room/";

				console.log("API Endpoint:", endpoint);

				if (mode === "edit") {
					// For edit mode: Use proper PUT method with JSON payload
					console.log("Sending PUT request with JSON...");

					const requestData = {
						name: values.name,
						description: values.description,
						rooms: roomsData,
					};

					console.log("Request data:", requestData);

					await authorizedClient.put(endpoint, requestData, {
						headers: {
							"Content-Type": "application/json",
						},
					});

					// Handle file uploads separately if needed
					if (thumbnailFile || soundtrackFile) {
						console.log("Uploading files separately...");
						const fileFormData = new FormData();

						if (thumbnailFile) {
							fileFormData.append("thumbnail", thumbnailFile);
						}
						if (soundtrackFile) {
							fileFormData.append("soundtrack", soundtrackFile);
						}

						// Upload files to a separate endpoint or handle them differently
						await authorizedClient.post(`${endpoint}/files`, fileFormData, {
							headers: {
								"Content-Type": "multipart/form-data",
							},
						});
					}
				} else {
					// For create mode: Use FormData but optimize it
					console.log("Sending POST request with optimized FormData...");

					const formData = new FormData();

					// Add basic fields
					formData.append("name", values.name);
					formData.append("description", values.description);

					// Add files directly if selected
					if (thumbnailFile) {
						console.log("Adding thumbnail file:", thumbnailFile.name);
						formData.append("thumbnail", thumbnailFile);
					}
					if (soundtrackFile) {
						console.log("Adding soundtrack file:", soundtrackFile.name);
						formData.append("soundtrack", soundtrackFile);
					}

					// Add rooms as JSON string to avoid exceeding form field limits
					formData.append("rooms", JSON.stringify(roomsData));

					console.log("Sending optimized FormData...");
					await authorizedClient.post(endpoint, formData, {
						headers: {
							"Content-Type": "multipart/form-data",
						},
					});
				}

				console.log("Request successful!");

				setStatus({
					type: "success",
					message:
						mode === "edit"
							? "Escape Room zaktualizowany pomyślnie!"
							: "Escape Room zapisany pomyślnie!",
				});

				// Always redirect to editor page after successful save
				setTimeout(() => {
					if (onSuccess) {
						onSuccess();
					}
					// Navigate back to editor page where user can select escape rooms
					window.location.href = "/editor";
				}, 1500);
			} catch (error: any) {
				console.error("=== ERROR SAVING ESCAPE ROOM ===");
				console.error("Error object:", error);
				console.error("Error response:", error?.response);
				console.error("Error response data:", error?.response?.data);

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
		if (thumbnailInputRef.current) {
			thumbnailInputRef.current.value = "";
		}
	};

	const removeSoundtrack = () => {
		setSoundtrackFile(null);
		setSoundtrackPreview(null);
		setIsPlaying(false);
		if (soundtrackInputRef.current) {
			soundtrackInputRef.current.value = "";
		}
	};

	// Initialize previews when modal opens
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

	// Check if we have minimum required data
	const hasValidData =
		currentEscapeRoom &&
		currentEscapeRoom.rooms &&
		currentEscapeRoom.rooms.length > 0;

	// Count valid riddles (with title, question, and answer)
	const validRiddlesCount =
		currentEscapeRoom?.rooms.reduce((total, room) => {
			return (
				total +
				(room.riddles?.filter(
					(riddle) => riddle.title && riddle.question && riddle.answer,
				).length || 0)
			);
		}, 0) || 0;

	// Check for rooms with too many riddles
	const roomsWithTooManyRiddles =
		currentEscapeRoom?.rooms.filter(
			(room) => (room.riddles?.length || 0) > 5,
		) || [];

	const hasRiddleErrors = roomsWithTooManyRiddles.length > 0;

	return (
		<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
			<div className='bg-gray-800 rounded-lg w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col'>
				{/* Header */}
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

				{/* Warning if no valid data */}
				{!hasValidData && (
					<div className='bg-red-600 text-white p-4 mx-6 mt-6 rounded-lg'>
						<div className='flex items-center'>
							<div className='mr-3'>⚠</div>
							<div>
								Brak wymaganych danych. Upewnij się, że masz utworzony
								przynajmniej jeden pokój z podstawową konfiguracją.
							</div>
						</div>
					</div>
				)}

				{/* Warning for too many riddles */}
				{hasRiddleErrors && (
					<div className='bg-orange-600 text-white p-4 mx-6 mt-6 rounded-lg'>
						<div className='flex items-center'>
							<div className='mr-3'>⚠</div>
							<div>
								<div className='font-semibold mb-1'>
									Przekroczono limit zagadek!
								</div>
								<div className='text-sm'>
									{roomsWithTooManyRiddles.length === 1 ? "Pokój" : "Pokoje"}{" "}
									{roomsWithTooManyRiddles
										.map(
											(room) =>
												(currentEscapeRoom?.rooms.findIndex(
													(r) => r === room,
												) ?? -1) + 1,
										)
										.join(", ")}{" "}
									{roomsWithTooManyRiddles.length === 1 ? "ma" : "mają"} więcej
									niż 5 zagadek. Usuń nadmiarowe zagadki przed zapisaniem.
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Content */}
				<div className='flex-1 overflow-y-auto p-6'>
					<form
						onSubmit={formik.handleSubmit}
						className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
						{/* Left Column - Basic Info */}
						<div className='space-y-6'>
							<div className='bg-gray-700 p-6 rounded-lg'>
								<h3 className='text-lg font-semibold text-white mb-4'>
									Podstawowe informacje
								</h3>

								{/* Name Field */}
								<div className='mb-4'>
									<label className='block text-sm font-medium text-gray-300 mb-2'>
										Nazwa * (obecna długość: {formik.values.name.length})
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

								{/* Description Field */}
								<div>
									<label className='block text-sm font-medium text-gray-300 mb-2'>
										Opis * (obecna długość: {formik.values.description.length})
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

							{/* Room Summary */}
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

									{/* Show validation info */}
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
										{validRiddlesCount === 0 && (
											<p className='text-yellow-400 text-xs mt-1'>
												💡 Zagadki bez tytułu, pytania lub odpowiedzi będą
												pominięte
											</p>
										)}
									</div>

									{currentEscapeRoom?.rooms.map((room, index) => {
										const validRiddlesInRoom =
											room.riddles?.filter(
												(riddle) =>
													riddle.title && riddle.question && riddle.answer,
											).length || 0;

										const totalRiddlesInRoom = room.riddles?.length || 0;
										const hasMaxRiddles = totalRiddlesInRoom >= 5;

										return (
											<div key={room.id} className='bg-gray-600 p-3 rounded'>
												<h4 className='text-white font-medium mb-2'>
													Pokój {index + 1}
													{hasMaxRiddles && (
														<span className='ml-2 text-xs bg-orange-600 text-white px-2 py-1 rounded'>
															MAX
														</span>
													)}
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
																	: validRiddlesInRoom > 0
																	? "text-green-400"
																	: "text-white"
															}`}>
															{validRiddlesInRoom} / {totalRiddlesInRoom}
															<span className='text-gray-400 text-xs ml-1'>
																(max 5)
															</span>
														</div>
														{totalRiddlesInRoom > 5 && (
															<div className='text-red-400 text-xs mt-1'>
																⚠ Przekroczono limit!
															</div>
														)}
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

						{/* Right Column - Media */}
						<div className='space-y-6'>
							{/* Thumbnail Section */}
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

							{/* Soundtrack Section */}
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

					{/* Status Message */}
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

				{/* Footer - Only two buttons: Anuluj and Zapisz */}
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
