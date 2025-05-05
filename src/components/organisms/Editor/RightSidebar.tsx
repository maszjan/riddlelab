/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react";
import { RIDDLE_TYPES } from "../../../utils/riddleHelpers";
import { RiddleFormState } from "../../../interfaces";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store";
import { v4 as uuidv4 } from "uuid";
import {
	addRiddle,
	setSelectedRiddle,
	removeRiddle,
	updateRiddle,
	addProp,
	removeProp,
	setSelectedProp,
	clearRoom,
	updateMetadata,
	updateWalls,
	updateWallThickness,
	acceptFloor,
	setFloorAndTexture,
	setDoorTexture,
	updateDoorTransformation,
	setCurrentRoom,
	addRoom,
	removeRoom,
	setSoundtrack,
} from "../../../store/slices/editorSlice";
import { isGridFilled, isBorderClosed } from "../../../utils/editorHelpers";
import { MdOutlineTexture } from "react-icons/md";
import { FiPlusCircle } from "react-icons/fi";
import AssetPickerModal from "./AssetPickerModal";
import useGetAsset from "../../../hooks/useGetAsset";

const RightSidebar = () => {
	const dispatch = useDispatch();
	const selectedTool = useSelector(
		(state: RootState) => state.editor.selectedTool,
	);
	const selectedRiddle = useSelector(
		(state: RootState) => state.editor.selectedRiddle,
	);

	const selectedProp = useSelector(
		(state: RootState) => state.editor.selectedProp,
	);

	const currentEscapeRoomId = useSelector(
		(state: RootState) => state.editor.currentEscapeRoomId,
	);

	const currentEscapeRoom = useSelector((state: RootState) =>
		state.editor.escapeRooms.find((er) => er.id === currentEscapeRoomId),
	);

	const currentRoom = useSelector((state: RootState) => {
		const escapeRoom = state.editor.escapeRooms.find(
			(er) => er.id === currentEscapeRoomId,
		);
		return escapeRoom?.rooms.find(
			(room) => room.id === state.editor.currentRoomId,
		);
	});

	const currentRoomId = useSelector(
		(state: RootState) => state.editor.currentRoomId,
	);

	const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
	const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);
	const [currentAssetType, setCurrentAssetType] = useState<string>("floor");
	const { asset: selectedAssetDetails } = useGetAsset(selectedAssetId);

	const [floorColor, setFloorColor] = useState<string | null>(
		currentRoom?.floorColor || null,
	);
	const [wallColor, setWallColor] = useState<string>(
		currentRoom?.wallColor || "#888888",
	);
	const [wallThickness, setWallThickness] = useState<number>(
		currentRoom?.wallThickness || 6,
	);

	const [colorOpacity, setColorOpacity] = useState(1);
	const [isBorderClosedState, setIsBorderClosedState] = useState(false);
	const [isGridFilledState, setIsGridFilledState] = useState(false);

	const [floorAssetId, setFloorAssetId] = useState<number | null>(
		currentRoom?.floorTextureAssetId || null,
	);
	const [doorAssetId, setDoorAssetId] = useState<number | null>(
		currentRoom?.doorTextureAssetId || null,
	);

	const [metadataName, setMetadataName] = useState<string>(
		currentEscapeRoom?.metadata?.name || "",
	);
	const [metadataDescription, setMetadataDescription] = useState<string>(
		currentEscapeRoom?.metadata?.description || "",
	);
	const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
	const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
		currentEscapeRoom?.metadata?.thumbnail || null,
	);
	const [soundtrackFile, setSoundtrackFile] = useState<File | null>(null);
	const [soundtrackPreview, setSoundtrackPreview] = useState<string | null>(
		currentEscapeRoom?.metadata?.soundtrack || null,
	);

	// Props states
	const [propName, setPropName] = useState<string>("");
	const [propFile, setPropFile] = useState<PropFile>({
		file: null,
		preview: null,
	});
	const [propHasCollider, setPropHasCollider] = useState<boolean>(false);
	const [propLibrary, setPropLibrary] = useState<
		Array<{
			id: string;
			name: string;
			imageUrl: string;
			hasCollider: boolean;
		}>
	>([]);
	const [riddleForm, setRiddleForm] = useState<RiddleFormState>({
		id: null,
		title: "",
		type: RIDDLE_TYPES.KNOWLEDGE,
		question: "",
		answer: "",
		hints: [],
		isEditing: false,
	});
	const [newHint, setNewHint] = useState<string>("");

	const handleAddRiddle = () => {
		if (
			riddleForm.title.trim() &&
			riddleForm.question.trim() &&
			riddleForm.answer.trim()
		) {
			const newRiddle = {
				id: `riddle-${uuidv4()}`,
				position: { row: 0, col: 0 },
				type: riddleForm.type,
				data: {
					title: riddleForm.title,
					question: riddleForm.question,
					answer: riddleForm.answer,
					hints: riddleForm.hints,
				},
			};
			dispatch(addRiddle(newRiddle));
			resetRiddleForm();
		}
	};

	const handleUpdateRiddle = () => {
		if (
			riddleForm.id &&
			riddleForm.title.trim() &&
			riddleForm.question.trim() &&
			riddleForm.answer.trim()
		) {
			dispatch(
				updateRiddle({
					riddleId: riddleForm.id,
					updates: {
						type: riddleForm.type,
						data: {
							title: riddleForm.title,
							question: riddleForm.question,
							answer: riddleForm.answer,
							hints: riddleForm.hints,
						},
					},
				}),
			);
			resetRiddleForm();
		}
	};

	const handleRemoveRiddle = (riddleId: string) => {
		dispatch(removeRiddle({ riddleId }));
		if (riddleForm.id === riddleId) {
			resetRiddleForm();
		}
	};

	const handleAddHint = () => {
		if (newHint.trim()) {
			setRiddleForm({
				...riddleForm,
				hints: [...riddleForm.hints, newHint],
			});
			setNewHint("");
		}
	};

	const resetRiddleForm = () => {
		setRiddleForm({
			id: null,
			title: "",
			type: RIDDLE_TYPES.KNOWLEDGE,
			question: "",
			answer: "",
			hints: [],
			isEditing: false,
		});
		setNewHint("");
	};

	const handleClearFloorColor = () => {
		setFloorColor(null);
	};

	const handleClearWallColor = () => {
		setWallColor(null);
	};

	const handleOpacityChange = (opacity: number) => {
		setColorOpacity(opacity / 100);
	};

	const handleRemoveProp = (propId: string) => {
		if (currentRoom) {
			dispatch(
				removeProp({
					roomId: currentRoom.id,
					propId,
				}),
			);
			setSelectedPropId(null); // Clear selection after removal
		}
	};

	const handleApplyDoorTexture = () => {
		let texturePath = null;
		if (selectedAssetDetails?.url) {
			const urlObj = new URL(selectedAssetDetails.url);
			texturePath = urlObj.pathname;
		}

		dispatch(
			setDoorTexture({
				texture: texturePath,
				textureAssetId: selectedAssetId, // Add the asset ID
			}),
		);
	};

	const handleFloorColorChange = (color: string) => {
		setFloorColor(color);
		dispatch(updateMetadata({ key: "floorColor", value: color }));
	};

	const handleAcceptFloor = () => {
		dispatch(acceptFloor());
	};

	const handleWallColorChange = (color: string) => {
		setWallColor(color);
	};

	const handleWallThicknessChange = (thickness: number) => {
		setWallThickness(thickness);
	};

	const handleApplyChanges = () => {
		const rgbaColor = floorColor
			? `rgba(${parseInt(floorColor.slice(1, 3), 16)}, ${parseInt(
					floorColor.slice(3, 5),
					16,
			  )}, ${parseInt(floorColor.slice(5, 7), 16)}, ${colorOpacity})`
			: null;

		let texturePath = null;
		if (selectedAssetDetails?.url) {
			const urlObj = new URL(selectedAssetDetails.url);
			texturePath = urlObj.pathname;
		}

		dispatch(
			setFloorAndTexture({
				color: rgbaColor,
				texture: texturePath,
				textureAssetId: selectedAssetId,
			}),
		);
		dispatch(
			updateWalls({
				key: "wallColor",
				color: wallColor,
			}),
		);
		dispatch(updateWallThickness(wallThickness));
	};

	const handleThumbnailChange = (file: File | null) => {
		if (file) {
			setThumbnailFile(file);
			const reader = new FileReader();
			reader.onload = () => {
				const thumbnailUrl = reader.result as string;
				setThumbnailPreview(thumbnailUrl);
				dispatch(updateMetadata({ key: "thumbnail", value: thumbnailUrl }));
			};
			reader.readAsDataURL(file);
		}
	};

	const handleSoundtrackChange = (file: File | null) => {
		if (file) {
			setSoundtrackFile(file);
			const reader = new FileReader();
			reader.onload = () => {
				const soundtrackUrl = reader.result as string;
				setSoundtrackPreview(soundtrackUrl);
				dispatch(updateMetadata({ key: "soundtrack", value: soundtrackUrl }));
				dispatch(setSoundtrack({ soundtrack: soundtrackUrl }));
			};
			reader.readAsDataURL(file);
		}
	};

	const handleMetadataChange = () => {
		dispatch(updateMetadata({ key: "name", value: metadataName }));
		dispatch(
			updateMetadata({ key: "description", value: metadataDescription }),
		);
	};

	const handleAddRoom = () => {
		// Check if we already have 3 rooms
		if (currentEscapeRoom?.rooms.length >= 3) {
			alert("Maksymalna liczba pokoi to 3.");
			return;
		}

		const roomNumber = currentEscapeRoom.rooms.length + 1;
		const roomId = `room-${uuidv4()}`;
		dispatch(
			addRoom({
				id: roomId,
				escapeRoomId: currentEscapeRoomId,
				name: `Pokój #${roomNumber}`,
				grid: {},
				walls: {},
				floorColor: "#cccccc",
				wallColor: "#888888",
				wallThickness: 6,
				floorTexture: null,
				door: null,
				doorTexture: null,
				startingPoint: null,
				riddles: [],
				props: [],
				floorAccepted: false,
			}),
		);
		dispatch(setCurrentRoom(roomId));
	};

	const handleRemoveRoom = (roomId: string) => {
		if (currentEscapeRoom?.rooms.length && currentEscapeRoom.rooms.length > 1) {
			dispatch(removeRoom({ roomId }));
			// Set current room to the first available room
			const newCurrentRoom = currentEscapeRoom.rooms.find(
				(r) => r.id !== roomId,
			);
			if (newCurrentRoom) {
				dispatch(setCurrentRoom(newCurrentRoom.id));
			}
		} else {
			alert("Cannot remove the last room in an escape room.");
		}
	};

	// Add this useEffect to load the prop library from localStorage
	useEffect(() => {
		const savedLibrary = localStorage.getItem("propLibrary");
		if (savedLibrary) {
			try {
				setPropLibrary(JSON.parse(savedLibrary));
			} catch (e) {
				console.error("Failed to load prop library:", e);
			}
		}
	}, []);

	// Add this function to add a prop from the library to the current room
	const handleAddPropFromLibrary = (libraryProp) => {
		if (currentRoom) {
			dispatch(
				addProp({
					roomId: currentRoom.id,
					prop: {
						id: `prop-${uuidv4()}`,
						name: libraryProp.name,
						imageUrl: libraryProp.imageUrl,
						position: { row: 0, col: 0 }, // Default position
						rotation: 0,
						hasCollider: libraryProp.hasCollider,
					},
				}),
			);
		}
	};

	const handlePropFileChange = (file: File | null) => {
		if (file) {
			const reader = new FileReader();
			reader.onload = () => {
				const imageUrl = reader.result as string;
				setPropFile({ file, preview: imageUrl });
			};
			reader.readAsDataURL(file);
		} else {
			setPropFile({ file: null, preview: null });
		}
	};

	// Add this useEffect to load the prop library from localStorage
	useEffect(() => {
		const savedLibrary = localStorage.getItem("propLibrary");
		if (savedLibrary) {
			try {
				setPropLibrary(JSON.parse(savedLibrary));
			} catch (e) {
				console.error("Failed to load prop library:", e);
			}
		}
	}, []);

	// Add this function to save the prop library to localStorage
	const savePropLibrary = (library) => {
		localStorage.setItem("propLibrary", JSON.stringify(library));
	};

	const handleAddProp = () => {
		if (propFile.preview && propName.trim() && currentRoom) {
			// Create the new prop
			const newProp = {
				id: `prop-${uuidv4()}`,
				name: propName,
				imageUrl: propFile.preview,
				position: { row: 0, col: 0 },
				rotation: 0,
				hasCollider: propHasCollider,
			};

			// Add to the current room
			dispatch(
				addProp({
					roomId: currentRoom.id,
					prop: newProp,
				}),
			);

			// Add to the library if not already present
			const existsInLibrary = propLibrary.some(
				(p) => p.imageUrl === propFile.preview,
			);

			if (!existsInLibrary) {
				const updatedLibrary = [
					...propLibrary,
					{
						id: `lib-${uuidv4()}`,
						name: propName,
						imageUrl: propFile.preview,
						hasCollider: propHasCollider,
					},
				];
				setPropLibrary(updatedLibrary);
				savePropLibrary(updatedLibrary);
			}

			// Reset form
			setPropFile({ file: null, preview: null });
			setPropName("");
			setPropHasCollider(false);
		}
	};

	const handleClearRoom = () => {
		dispatch(clearRoom());
		setFloorColor("#cccccc");
	};

	const handleRiddleSelection = (riddle) => {
		// If this riddle is already selected in Redux for positioning
		if (selectedRiddle === riddle.id) {
			// Deselect it from Redux and select it for editing
			dispatch(setSelectedRiddle(null));
			setRiddleForm({
				id: riddle.id,
				title: riddle.data?.title || "",
				type: riddle.type || RIDDLE_TYPES.KNOWLEDGE,
				question: riddle.data?.question || "",
				answer: riddle.data?.answer || "",
				hints: riddle.data?.hints || [],
				isEditing: true,
			});
		}
		// If this riddle is already being edited
		else if (riddleForm.id === riddle.id && riddleForm.isEditing) {
			// Switch to positioning mode
			setRiddleForm({
				...riddleForm,
				isEditing: false,
			});
			dispatch(setSelectedRiddle(riddle.id));
		}
		// If it's not selected at all
		else {
			// Select for editing
			setRiddleForm({
				id: riddle.id,
				title: riddle.data?.title || "",
				type: riddle.type || RIDDLE_TYPES.KNOWLEDGE,
				question: riddle.data?.question || "",
				answer: riddle.data?.answer || "",
				hints: riddle.data?.hints || [],
				isEditing: true,
			});
			dispatch(setSelectedRiddle(null));
		}
	};

	useEffect(() => {
		if (currentRoom?.grid) {
			const grid = currentRoom.grid;

			const borderClosed = isBorderClosed(grid);

			const gridFilled = borderClosed && isGridFilled(grid);

			setIsBorderClosedState(borderClosed);
			setIsGridFilledState(gridFilled);
		} else {
			setIsBorderClosedState(false);
			setIsGridFilledState(false);
		}
	}, [currentRoom?.grid]);

	useEffect(() => {
		if (currentEscapeRoom?.metadata) {
			setMetadataName(currentEscapeRoom.metadata.name || "");
			setMetadataDescription(currentEscapeRoom.metadata.description || "");
			setThumbnailPreview(currentEscapeRoom.metadata.thumbnail);
			setSoundtrackPreview(currentEscapeRoom.metadata.soundtrack);
		}
	}, [currentEscapeRoom]);

	useEffect(() => {
		if (currentRoom) {
			setFloorColor(currentRoom.floorColor || "#cccccc");
			setWallColor(currentRoom.wallColor || "#888888");
			setWallThickness(currentRoom.wallThickness || 6);
			setDoorTextureState(currentRoom.doorTexture);

			// Inicjalizuj ID assetów z Redux
			setFloorAssetId(currentRoom.floorTextureAssetId || null);
			setDoorAssetId(currentRoom.doorTextureAssetId || null);

			// Ustaw selectedAssetId na podstawie aktualnego narzędzia
			if (selectedTool === "paintFloor" && currentRoom.floorTextureAssetId) {
				setSelectedAssetId(currentRoom.floorTextureAssetId);
				setCurrentAssetType("floor");
			} else if (selectedTool === "door" && currentRoom.doorTextureAssetId) {
				setSelectedAssetId(currentRoom.doorTextureAssetId);
				setCurrentAssetType("door");
			}
		}
	}, [currentRoom, selectedTool]);

	const renderToolOptions = () => {
		if (!currentRoom) return null;

		switch (selectedTool) {
			case "paintFloor": {
				if (!currentRoom.floorAccepted) {
					return (
						<div>
							<h4 className='text-md font-bold text-white mb-2'>Podłoga</h4>
							<p className='text-sm text-gray-300'>
								Kliknij na siatkę, aby rysować podłogę.
							</p>

							{!isBorderClosedState && (
								<p className='text-sm text-yellow-500 mt-2'>
									Musisz narysować zamkniętą granicę, aby wypełnić podłogę.
								</p>
							)}

							{isBorderClosedState && !isGridFilledState && (
								<p className='text-sm text-red-500 mt-2'>
									Wszystkie pola wewnątrz granicy muszą być wypełnione.
								</p>
							)}

							{isGridFilledState && (
								<button
									onClick={handleAcceptFloor}
									className='w-24 bg-mainMint text-gray-700 py-2 rounded mt-4'>
									Zatwierdź
								</button>
							)}
						</div>
					);
				}
				return (
					<div className='flex flex-col space-y-4 mr-5'>
						<div className='flex flex-col space-y-4'>
							<h4 className='text-md font-bold text-white mb-4'>
								Dostosowanie podłogi
							</h4>
							<p className='text-sm text-gray-300 mb-2'>
								Wybierz kolor i/lub teksturę
							</p>

							<div className='flex flex-col space-y-2'>
								<div className='flex items-center justify-between'>
									<label className='text-lg mt-1 text-gray-300'>Kolor:</label>
									<input
										type='color'
										value={floorColor || "#000000"}
										onChange={(e) => handleFloorColorChange(e.target.value)}
										className='w-12 h-6 border-none rounded'
									/>
								</div>

								{/* Color Preview */}
								{floorColor && (
									<div>
										<div className='relative w-24 h-24 border border-gray-600 rounded overflow-hidden mt-2'>
											<div
												className='absolute inset-0'
												style={{
													backgroundColor: floorColor,
													opacity: colorOpacity,
												}}></div>
											<button
												onClick={handleClearFloorColor}
												className='absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600'
												title='Usuń kolor'>
												X
											</button>
										</div>
									</div>
								)}

								{/* Opacity Slider */}
								{floorColor && (
									<div className='flex items-center justify-between mt-2'>
										<label className='text-sm text-gray-300'>
											Przezroczystość:
										</label>
										<input
											type='range'
											min={0}
											max={100}
											value={colorOpacity * 100}
											onChange={(e) =>
												handleOpacityChange(parseInt(e.target.value, 10))
											}
											className='w-full ml-4 accent-mainMint'
										/>
									</div>
								)}
							</div>

							<div className='flex flex-col space-y-2'>
								<div className='flex items-center justify-between'>
									<label className='text-lg mt-1 text-gray-300'>
										Tekstura:
									</label>
									<div className='relative'>
										<button
											onClick={() => {
												setCurrentAssetType("floor");
												setIsAssetModalOpen(true);
											}}
											className='flex items-center justify-center w-12 h-12 bg-gray-700 text-white rounded cursor-pointer hover:bg-gray-600'>
											<MdOutlineTexture className='h-6 w-6' />
										</button>
									</div>
								</div>

								{selectedAssetDetails?.url && (
									<div className='mt-2 relative'>
										<div className='relative w-24 h-24 border border-gray-600 rounded overflow-hidden'>
											<div
												className='absolute inset-0'
												style={{
													backgroundImage: `url(${selectedAssetDetails.url})`,
													backgroundSize: "cover",
													backgroundPosition: "center",
												}}></div>
											<button
												onClick={() => {
													setSelectedAssetId(null);
													setSelectedTexture(null);
												}}
												className='absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600'
												title='Usuń teksturę'>
												X
											</button>
										</div>
									</div>
								)}
							</div>
						</div>

						<h4 className='text-md font-bold text-white mb-4'>
							Dostosowanie ścian
						</h4>
						<p className='text-sm text-gray-300 mb-2'>
							Wybierz kolor i grubość
						</p>
						<div className='flex flex-col space-y-4'>
							<div className='flex items-center  justify-between'>
								<label className='text-lg text-gray-300'>Kolor:</label>
								<input
									type='color'
									value={wallColor}
									onChange={(e) => handleWallColorChange(e.target.value)}
									className='w-12 h-6 border-none rounded'
								/>
							</div>
							{wallColor && (
								<div>
									<div className='relative w-24 h-24 border border-gray-600 rounded overflow-hidden mt-2'>
										<div
											className='absolute inset-0'
											style={{
												backgroundColor: wallColor,
											}}></div>
										<button
											onClick={handleClearWallColor}
											className='absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600'
											title='Usuń kolor'>
											X
										</button>
									</div>
								</div>
							)}
							<div className='flex items-center justify-between'>
								<label className='text-lg text-gray-300'>Grubość:</label>
								<input
									type='range'
									min={1}
									max={20}
									value={wallThickness}
									onChange={(e) =>
										handleWallThicknessChange(parseInt(e.target.value, 10))
									}
									className='w-full ml-4 accent-mainMint'
								/>
							</div>
						</div>
						<button
							onClick={handleApplyChanges}
							className='w-24 bg-mainMint font-semibold text-gray-700 py-2 rounded mt-4'>
							Użyj
						</button>
					</div>
				);
			}

			case "eraseFloor":
				return (
					<div>
						<h4 className='text-md font-bold text-white mb-4'>Usuwanie</h4>
						<p className='text-sm text-gray-300'>
							Kliknij na siatkę, aby usuwać podłogę.
						</p>
					</div>
				);
			case "door":
				return (
					<div className='mx-2'>
						<h4 className='text-md font-bold text-white mb-4'>Opcje drzwi</h4>
						<p className='text-sm text-gray-300 mb-2'>
							Wybierz teksturę drzwi, a następnie kliknij na siatkę, aby je
							umieścić.
						</p>
						<div className='flex flex-col space-y-4'>
							<div className='flex items-center justify-between'>
								<label className='text-lg mt-1 text-gray-300'>Tekstura:</label>
								<div className='relative'>
									<button
										onClick={() => {
											setCurrentAssetType("door");
											setIsAssetModalOpen(true);
										}}
										className='flex items-center justify-center w-12 h-12 bg-gray-700 text-white rounded cursor-pointer hover:bg-gray-600'>
										<MdOutlineTexture className='h-6 w-6' />
									</button>
								</div>
							</div>

							{selectedAssetDetails?.url && currentAssetType === "door" && (
								<div className='mt-2 relative'>
									<div className='relative w-24 h-24 border border-gray-600 rounded overflow-hidden'>
										<div
											className='absolute inset-0'
											style={{
												backgroundImage: `url(${selectedAssetDetails.url})`,
												backgroundSize: "cover",
												backgroundPosition: "center",
											}}></div>
										<button
											onClick={() => {
												setSelectedAssetId(null);
												setDoorTextureState(null);
												dispatch(setDoorTexture({ texture: null }));
											}}
											className='absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600'
											title='Usuń teksturę'>
											X
										</button>
									</div>
								</div>
							)}

							{currentRoom?.door &&
								selectedAssetDetails?.url &&
								currentAssetType === "door" && (
									<div className='mt-4'>
										<h5 className='text-sm font-bold text-white mb-2'>
											Transformacje
										</h5>

										<div className='mb-2'>
											<label className='text-sm text-gray-300 block mb-1'>
												Rotacja drzwi:
											</label>
											<div className='flex items-center'>
												<input
													type='range'
													min={0}
													max={360}
													value={currentRoom.door.rotation || 0}
													onChange={(e) =>
														dispatch(
															updateDoorTransformation({
																rotation: parseInt(e.target.value),
															}),
														)
													}
													className='w-24 accent-mainMint mr-2'
												/>
												<input
													type='number'
													min={0}
													max={360}
													value={currentRoom.door.rotation || 0}
													onChange={(e) =>
														dispatch(
															updateDoorTransformation({
																rotation: parseInt(e.target.value) || 0,
															}),
														)
													}
													className='w-16 bg-gray-700 text-white rounded px-2 py-1 text-sm'
												/>
												<span className='text-xs text-gray-300 ml-2'>°</span>
											</div>
										</div>
									</div>
								)}

							{/* Przycisk "Użyj" dla drzwi */}
							{selectedAssetDetails?.url && currentAssetType === "door" && (
								<button
									onClick={handleApplyDoorTexture}
									className='w-24 bg-mainMint font-semibold text-gray-700 py-2 rounded mt-4'>
									Użyj
								</button>
							)}
						</div>
					</div>
				);

			case "startPoint":
				return (
					<div>
						<h4 className='text-md font-bold text-white mb-4'>
							Opcje punktu startowego
						</h4>
						<p className='text-sm text-gray-300'>
							Kliknij na siatkę, aby ustawić punkt startowy.
						</p>
					</div>
				);
			case "riddle":
				return (
					<div>
						<h4 className='text-md font-bold text-white mb-4'>
							Zarządzanie zagadkami
						</h4>

						{selectedRiddle && (
							<div className='mb-4 p-2 bg-yellow-600 bg-opacity-20 rounded'>
								<div className='flex justify-between items-center'>
									<span className='text-sm text-white'>
										Wybrana zagadka do przeniesienia
									</span>
									<button
										onClick={() => dispatch(setSelectedRiddle(null))}
										className='text-xs text-red-400'>
										Anuluj
									</button>
								</div>
								<p className='text-xs text-gray-300 mt-1'>
									Kliknij na siatkę, aby przenieść zagadkę
								</p>
							</div>
						)}

						{currentRoom?.riddles && currentRoom.riddles.length > 0 ? (
							<div className='mb-4'>
								<h5 className='text-sm font-bold text-white mb-2'>
									Istniejące zagadki ({currentRoom.riddles.length}/5)
								</h5>
								<ul className='text-sm text-gray-300 mb-4 max-h-40 overflow-y-auto'>
									{currentRoom.riddles.map((riddle) => (
										<li
											key={riddle.id}
											className={`flex justify-between items-center mb-2 p-2 ${
												riddleForm.id === riddle.id && riddleForm.isEditing
													? "bg-gray-600"
													: selectedRiddle === riddle.id
													? "bg-mainMint bg-opacity-20"
													: "bg-gray-700"
											} rounded cursor-pointer`}
											onClick={() => handleRiddleSelection(riddle)}>
											<div className='flex items-center'>
												<div
													className='w-4 h-4 mr-2 rounded-full'
													style={{
														backgroundColor:
															selectedRiddle === riddle.id
																? "#3BCEAC"
																: "transparent",
														border: "1px solid #3BCEAC",
													}}
												/>
												<span className='text-xs'>
													{riddle.data?.title || "Bez tytułu"}
												</span>
											</div>
											<div className='flex'>
												{!(
													riddleForm.id === riddle.id && riddleForm.isEditing
												) && (
													<button
														onClick={(e) => {
															e.stopPropagation();
															dispatch(setSelectedRiddle(riddle.id));
															setRiddleForm({
																...riddleForm,
																isEditing: false,
															});
														}}
														className='text-blue-400 text-xs mr-2'>
														Przenieś
													</button>
												)}
												<button
													onClick={(e) => {
														e.stopPropagation();
														handleRemoveRiddle(riddle.id);
													}}
													className='text-red-500 text-xs'>
													Usuń
												</button>
											</div>
										</li>
									))}
								</ul>
							</div>
						) : (
							<p className='text-sm text-gray-300 mb-4'>
								Brak zagadek. Dodaj pierwszą!
							</p>
						)}

						{/* Form for adding/editing riddles */}
						<div className='mb-4'>
							<h5 className='text-sm font-bold text-white mb-2'>
								{riddleForm.isEditing ? "Edytuj zagadkę" : "Dodaj nową zagadkę"}
							</h5>

							<input
								type='text'
								value={riddleForm.title}
								onChange={(e) =>
									setRiddleForm({ ...riddleForm, title: e.target.value })
								}
								placeholder='Tytuł zagadki'
								className='w-full px-2 py-1 bg-gray-700 text-white rounded text-sm mb-2'
							/>

							<select
								value={riddleForm.type}
								onChange={(e) =>
									setRiddleForm({ ...riddleForm, type: e.target.value })
								}
								className='w-full px-2 py-1 bg-gray-700 text-white rounded text-sm mb-2'>
								{Object.entries(RIDDLE_TYPES).map(([key, value]) => (
									<option key={key} value={value}>
										{key}
									</option>
								))}
							</select>

							<textarea
								value={riddleForm.question}
								onChange={(e) =>
									setRiddleForm({ ...riddleForm, question: e.target.value })
								}
								placeholder='Treść zagadki'
								className='w-full px-2 py-1 bg-gray-700 text-white rounded text-sm h-20 mb-2'
							/>

							<input
								type='text'
								value={riddleForm.answer}
								onChange={(e) =>
									setRiddleForm({ ...riddleForm, answer: e.target.value })
								}
								placeholder='Odpowiedź'
								className='w-full px-2 py-1 bg-gray-700 text-white rounded text-sm mb-2'
							/>

							{/* Hints section */}
							<div className='mb-2'>
								<label className='text-xs text-gray-300 block mb-1'>
									Podpowiedzi:
								</label>
								{riddleForm.hints.map((hint, index) => (
									<div
										key={index}
										className='flex justify-between items-center mb-1'>
										<span className='text-xs text-gray-300'>{hint}</span>
										<button
											onClick={() => {
												const newHints = [...riddleForm.hints];
												newHints.splice(index, 1);
												setRiddleForm({ ...riddleForm, hints: newHints });
											}}
											className='text-red-500 text-xs'>
											Usuń
										</button>
									</div>
								))}
								<div className='flex'>
									<input
										type='text'
										value={newHint}
										onChange={(e) => setNewHint(e.target.value)}
										placeholder='Nowa podpowiedź'
										className='flex-grow px-2 py-1 bg-gray-700 text-white rounded-l text-sm'
									/>
									<button
										onClick={handleAddHint}
										className='px-2 py-1 bg-mainMint text-gray-700 rounded-r'>
										Dodaj
									</button>
								</div>
							</div>

							{/* Action buttons */}
							<div className='flex space-x-2'>
								{riddleForm.isEditing ? (
									<>
										<button
											onClick={handleUpdateRiddle}
											className='flex-1 py-2 bg-mainMint text-gray-700 rounded'>
											Aktualizuj
										</button>
										<button
											onClick={resetRiddleForm}
											className='flex-1 py-2 bg-gray-600 text-white rounded'>
											Anuluj
										</button>
									</>
								) : (
									<button
										onClick={handleAddRiddle}
										className='w-full py-2 bg-mainMint text-gray-700 rounded'
										disabled={
											!riddleForm.title.trim() ||
											!riddleForm.question.trim() ||
											!riddleForm.answer.trim()
										}>
										Dodaj zagadkę
									</button>
								)}
							</div>
						</div>

						{currentRoom?.riddles && currentRoom.riddles.length >= 5 && (
							<p className='text-xs text-yellow-500'>
								Osiągnięto maksymalną liczbę zagadek (5) dla tego pokoju.
							</p>
						)}
					</div>
				);

			case "props":
				return (
					<div>
						<h4 className='text-md font-bold text-white mb-4'>Przedmioty</h4>

						{/* Selected Prop Indicator for positioning */}
						{selectedProp && (
							<div className='mb-4 p-2 bg-yellow-600 bg-opacity-20 rounded'>
								<div className='flex justify-between items-center'>
									<span className='text-sm text-white'>
										Wybrany przedmiot do przeniesienia
									</span>
									<button
										onClick={() => dispatch(setSelectedProp(null))}
										className='text-xs text-red-400'>
										Anuluj
									</button>
								</div>
								<p className='text-xs text-gray-300 mt-1'>
									Kliknij na siatkę, aby przenieść przedmiot
								</p>
							</div>
						)}

						{/* Current Room Props */}
						<h5 className='text-sm font-bold text-white mb-2'>
							Przedmioty w pokoju
						</h5>
						{currentRoom.props?.length ? (
							<ul className='text-sm text-gray-300 mb-4 max-h-40 overflow-y-auto'>
								{currentRoom.props.map((prop) => (
									<li
										key={prop.id}
										className={`flex justify-between items-center mb-2 p-2 ${
											selectedProp === prop.id
												? "bg-mainMint bg-opacity-20"
												: "bg-gray-700"
										} rounded`}>
										<div className='flex items-center'>
											<div className='w-8 h-8 mr-2 bg-gray-600 rounded overflow-hidden'>
												<img
													src={prop.imageUrl}
													alt={prop.name}
													className='w-full h-full object-cover'
												/>
											</div>
											<span className='text-xs'>{prop.name}</span>
										</div>
										<div className='flex'>
											<button
												onClick={() =>
													dispatch(
														setSelectedProp(
															selectedProp === prop.id ? null : prop.id,
														),
													)
												}
												className='text-blue-400 text-xs mr-2'>
												{selectedProp === prop.id ? "Anuluj" : "Przenieś"}
											</button>
											<button
												onClick={() => handleRemoveProp(prop.id)}
												className='text-red-500 text-xs'>
												Usuń
											</button>
										</div>
									</li>
								))}
							</ul>
						) : (
							<p className='text-sm text-gray-300 mb-4'>Brak przedmiotów.</p>
						)}

						{/* Prop Library */}
						<h5 className='text-sm font-bold text-white mb-2'>
							Biblioteka przedmiotów
						</h5>
						<div className='mb-4 max-h-40 overflow-y-auto'>
							{propLibrary.length > 0 ? (
								<div className='grid grid-cols-3 gap-2'>
									{propLibrary.map((prop) => (
										<div
											key={prop.id}
											className='bg-gray-700 p-1 rounded cursor-pointer hover:bg-gray-600'
											onClick={() => handleAddPropFromLibrary(prop)}>
											<div className='w-full h-12 bg-gray-600 rounded overflow-hidden mb-1'>
												<img
													src={prop.imageUrl}
													alt={prop.name}
													className='w-full h-full object-cover'
												/>
											</div>
											<p className='text-xs text-gray-300 truncate text-center'>
												{prop.name}
											</p>
										</div>
									))}
								</div>
							) : (
								<p className='text-sm text-gray-300'>
									Brak zapisanych przedmiotów.
								</p>
							)}
						</div>

						{/* Add New Prop */}
						<h5 className='text-sm font-bold text-white mb-2'>
							Dodaj nowy przedmiot
						</h5>
						<input
							type='text'
							placeholder='Nazwa przedmiotu'
							value={propName}
							onChange={(e) => setPropName(e.target.value)}
							className='w-full px-2 py-1 bg-gray-700 text-white rounded mb-2'
						/>

						<div className='mb-4'>
							<label className='text-sm text-gray-300 block mb-1'>
								Obraz przedmiotu:
							</label>
							<div className='flex items-center'>
								<input
									type='file'
									accept='image/*'
									onChange={(e) =>
										handlePropFileChange(e.target.files?.[0] || null)
									}
									className='hidden'
									id='propFileInput'
								/>
								<label
									htmlFor='propFileInput'
									className='flex items-center justify-center px-3 py-1 bg-gray-700 text-white rounded cursor-pointer hover:bg-gray-600 text-sm'>
									Wybierz plik
								</label>
								{propFile.preview && (
									<div className='ml-2 w-8 h-8 bg-gray-600 rounded overflow-hidden'>
										<img
											src={propFile.preview}
											alt='Prop Preview'
											className='w-full h-full object-cover'
										/>
									</div>
								)}
							</div>
							{propFile.file && (
								<p className='text-xs text-gray-400 mt-1'>
									Wybrany plik: {propFile.file.name} (
									{Math.round(propFile.file.size / 1024)} KB)
								</p>
							)}
						</div>

						<div className='flex items-center mb-4'>
							<input
								type='checkbox'
								id='hasCollider'
								checked={propHasCollider}
								onChange={(e) => setPropHasCollider(e.target.checked)}
								className='mr-2'
							/>
							<label htmlFor='hasCollider' className='text-sm text-gray-300'>
								Ma kolizję (blokuje ruch)
							</label>
						</div>

						<button
							onClick={handleAddProp}
							disabled={!propFile.preview || !propName.trim()}
							className={`w-full py-2 rounded font-semibold ${
								propFile.preview && propName.trim()
									? "bg-mainMint text-gray-700"
									: "bg-gray-600 text-gray-400 cursor-not-allowed"
							}`}>
							Dodaj Przedmiot
						</button>
					</div>
				);
			case "metadata":
				return (
					<div>
						<h4 className='text-md font-bold text-white mb-4'>Ogólne</h4>

						<div className='mb-2'>
							<label className='text-sm text-gray-300 block mb-1'>Nazwa:</label>
							<input
								type='text'
								value={metadataName}
								onChange={(e) => setMetadataName(e.target.value)}
								className='w-full px-2 py-1 bg-gray-700 text-white rounded text-sm'
							/>
						</div>
						<div className='mb-2'>
							<label className='text-sm text-gray-300 block mb-1'>Opis:</label>
							<textarea
								value={metadataDescription}
								onChange={(e) => setMetadataDescription(e.target.value)}
								className='w-full px-2 py-1 bg-gray-700 text-white rounded text-sm h-20'
							/>
						</div>
						<div className='mb-4'>
							<label className='text-sm font-bold text-gray-300 block mb-1'>
								Miniatura:
							</label>
							<div className='flex flex-col'>
								<div className='flex items-center mb-2'>
									<input
										type='file'
										accept='image/*'
										onChange={(e) =>
											handleThumbnailChange(e.target.files?.[0] || null)
										}
										className='hidden'
										id='thumbnailInput'
									/>
									<label
										htmlFor='thumbnailInput'
										className='flex items-center justify-center px-3 py-1 bg-gray-700 text-white rounded cursor-pointer hover:bg-gray-600 text-sm'>
										Wybierz
									</label>
									{thumbnailFile && (
										<span className='ml-2 text-xs text-gray-400'>
											{thumbnailFile.name} (
											{Math.round(thumbnailFile.size / 1024)} KB)
										</span>
									)}
								</div>

								{thumbnailPreview && (
									<div className='mt-2 border border-gray-600 rounded overflow-hidden'>
										<div className='bg-gray-700 px-2 py-1 text-xs text-gray-300'>
											Podgląd miniatury
										</div>
										<div className='w-full h-32 bg-gray-600'>
											<img
												src={thumbnailPreview}
												alt='Thumbnail'
												className='w-full h-full object-contain'
											/>
										</div>
									</div>
								)}
							</div>
						</div>

						<div className='mb-2'>
							<label className='text-sm text-gray-300 block mb-1'>
								Ścieżka dźwiękowa:
							</label>
							<div className='flex items-center'>
								<input
									type='file'
									accept='audio/*'
									onChange={(e) =>
										handleSoundtrackChange(e.target.files?.[0] || null)
									}
									className='hidden'
									id='soundtrackInput'
								/>
								<label
									htmlFor='soundtrackInput'
									className='flex items-center justify-center px-3 py-1 bg-gray-700 text-white rounded cursor-pointer hover:bg-gray-600 text-sm'>
									Wybierz
								</label>
								{soundtrackPreview && soundtrackFile && (
									<div className='ml-2 flex items-center'>
										<audio
											controls
											src={soundtrackPreview}
											className='h-8 w-32'
										/>
									</div>
								)}
							</div>
						</div>
						<button
							onClick={handleMetadataChange}
							className='w-full mt-2 bg-mainMint text-gray-700 py-1 rounded text-sm font-semibold'>
							Zapisz metadane
						</button>
					</div>
				);
			case "roomManager":
				return (
					<div className='flex flex-col space-y-6'>
						<div>
							<h4 className='text-md font-bold text-white mb-4'>
								Zarządzaj pokojami
							</h4>

							<div className='mb-4'>
								<ul className='mb-2 max-h-40 overflow-y-auto'>
									{currentEscapeRoom?.rooms.map((room, index) => (
										<li
											key={room.id}
											className='flex justify-between items-center mb-1 p-2 bg-gray-700 rounded'>
											<button
												onClick={() => dispatch(setCurrentRoom(room.id))}
												className={`text-sm ${
													room.id === currentRoomId
														? "text-mainMint font-bold"
														: "text-gray-300"
												}`}>
												#{index + 1}
											</button>
											<button
												onClick={() => handleRemoveRoom(room.id)}
												className='text-red-500 text-2xl hover:text-red-400'
												disabled={currentEscapeRoom?.rooms.length <= 1}>
												X
											</button>
										</li>
									))}
								</ul>

								{/* Add room button without input field */}
								{currentEscapeRoom?.rooms.length < 3 && (
									<button
										onClick={handleAddRoom}
										className='w-full bg-mainMint text-gray-700 py-2 rounded font-semibold flex items-center justify-center'>
										<FiPlusCircle className='mr-2' /> Dodaj pokój
									</button>
								)}
							</div>
						</div>
					</div>
				);
			case "clearRoom":
				return (
					<div>
						<h4 className='text-md font-bold text-white mb-4'>Wyczyść Pokój</h4>
						<p className='text-sm text-gray-300 mb-2'>
							Usuń wszystkie elementy z pokoju.
						</p>
						<button
							onClick={handleClearRoom}
							className='w-24 bg-red-500 text-white py-2 rounded'>
							Wyczyść
						</button>
					</div>
				);
			default:
				return (
					<p className='text-sm text-gray-300'>
						Wybierz narzędzie, aby zobaczyć opcje.
					</p>
				);
		}
	};

	return (
		<>
			<div className='w-64 pt-14 mx-4 bg-gray-800 p-6 border-l border-gray-600 h-full overflow-y-auto'>
				{renderToolOptions()}
			</div>
			<AssetPickerModal
				isOpen={isAssetModalOpen}
				onClose={() => setIsAssetModalOpen(false)}
				onSelect={(assetId) => {
					setSelectedAssetId(assetId);
					setIsAssetModalOpen(false);

					if (currentAssetType === "floor") {
						setSelectedTexture(selectedAssetDetails?.url || null);
					} else if (currentAssetType === "door") {
						setDoorTextureState(selectedAssetDetails?.url || null);
						dispatch(
							setDoorTexture({ texture: selectedAssetDetails?.url || null }),
						);
					}
				}}
				assetType={currentAssetType}
				title={`Wybierz teksturę ${
					currentAssetType === "floor" ? "podłogi" : "drzwi"
				}`}
			/>
			;
		</>
	);
};

export default RightSidebar;
