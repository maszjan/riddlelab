import React, { useState, useEffect } from "react";
import { RIDDLE_TYPES } from "../../../utils/riddleHelpers";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store";
import { v4 as uuidv4 } from "uuid";
import {
	addRiddle,
	removeRiddle,
	updateRiddle,
	addProp,
	removeProp,
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

const RightSidebar = () => {
	const dispatch = useDispatch();
	const selectedTool = useSelector(
		(state: RootState) => state.editor.selectedTool,
	);
	const selectedRiddle = useSelector(
		(state: RootState) => state.editor.selectedRiddle,
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

	const [floorColor, setFloorColor] = useState<string | null>(
		currentRoom?.floorColor || null,
	);
	const [selectedTexture, setSelectedTexture] = useState<string | null>(null);
	const [wallColor, setWallColor] = useState<string>(
		currentRoom?.wallColor || "#888888",
	);
	const [wallThickness, setWallThickness] = useState<number>(
		currentRoom?.wallThickness || 6,
	);

	const [colorOpacity, setColorOpacity] = useState(1);
	const [isBorderClosedState, setIsBorderClosedState] = useState(false);
	const [isGridFilledState, setIsGridFilledState] = useState(false);
	const [doorTexture, setDoorTextureState] = useState<string | null>(
		currentRoom?.doorTexture || null,
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
	const [selectedRiddleId, setSelectedRiddleId] = useState<string | null>(null);
	const [riddleTitle, setRiddleTitle] = useState<string>("");
	const [riddleType, setRiddleType] = useState<string>(RIDDLE_TYPES.KNOWLEDGE);
	const [riddleQuestion, setRiddleQuestion] = useState<string>("");
	const [riddleAnswer, setRiddleAnswer] = useState<string>("");
	const [riddleHints, setRiddleHints] = useState<string[]>([]);
	const [newHint, setNewHint] = useState<string>("");

	const handleAddRiddle = () => {
		if (riddleTitle.trim() && riddleQuestion.trim() && riddleAnswer.trim()) {
			const newRiddle = {
				id: `riddle-${uuidv4()}`,
				position: { row: 0, col: 0 }, // Default position
				type: riddleType,
				data: {
					title: riddleTitle,
					question: riddleQuestion,
					answer: riddleAnswer,
					hints: riddleHints,
				},
			};
			dispatch(addRiddle(newRiddle));
			resetRiddleForm();
		}
	};

	const handleUpdateRiddle = () => {
		if (
			selectedRiddleId &&
			riddleTitle.trim() &&
			riddleQuestion.trim() &&
			riddleAnswer.trim()
		) {
			dispatch(
				updateRiddle({
					riddleId: selectedRiddleId,
					updates: {
						type: riddleType,
						data: {
							title: riddleTitle,
							question: riddleQuestion,
							answer: riddleAnswer,
							hints: riddleHints,
						},
					},
				}),
			);
			resetRiddleForm();
		}
	};

	const handleRemoveRiddle = (riddleId: string) => {
		dispatch(removeRiddle({ riddleId }));
		if (selectedRiddleId === riddleId) {
			resetRiddleForm();
		}
	};

	const handleAddHint = () => {
		if (newHint.trim()) {
			setRiddleHints([...riddleHints, newHint]);
			setNewHint("");
		}
	};

	const resetRiddleForm = () => {
		setSelectedRiddleId(null);
		setRiddleTitle("");
		setRiddleType(RIDDLE_TYPES.KNOWLEDGE);
		setRiddleQuestion("");
		setRiddleAnswer("");
		setRiddleHints([]);
		setNewHint("");
	};

	const handleClearFloorColor = () => {
		setFloorColor(null);
	};

	const handleClearWallColor = () => {
		setWallColor(null);
	};

	const handleOpacityChange = (opacity: number) => {
		setColorOpacity(opacity / 100); // Convert percentage to 0-1 range
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

	const handleDoorTextureChange = (file: File | undefined) => {
		if (file) {
			const reader = new FileReader();
			reader.onload = () => {
				const textureUrl = reader.result as string;
				setDoorTextureState(textureUrl);
				dispatch(setDoorTexture({ texture: textureUrl }));
			};
			reader.readAsDataURL(file);
		}
	};

	const handleClearDoorTexture = () => {
		setDoorTextureState(null);
		dispatch(setDoorTexture({ texture: null }));
	};

	const handleFloorTextureChange = (file: File | undefined) => {
		if (file) {
			const reader = new FileReader();
			reader.onload = () => {
				const textureUrl = reader.result as string;
				setSelectedTexture(textureUrl);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleClearTexture = () => {
		setSelectedTexture(null);
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

		dispatch(
			setFloorAndTexture({
				color: rgbaColor,
				texture: selectedTexture, // Dispatch the selected texture (or null if cleared)
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
				// Add this line to use setSoundtrack
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
		}
	}, [currentRoom]);

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
										<input
											type='file'
											accept='image/*'
											onChange={(e) =>
												handleFloorTextureChange(e.target.files?.[0])
											}
											className='hidden'
											id='floorTextureInput'
										/>
										<label
											htmlFor='floorTextureInput'
											className='flex items-center justify-center w-12 h-12 bg-gray-700 text-white rounded cursor-pointer hover:bg-gray-600'>
											<MdOutlineTexture className='h-6 w-6' />
										</label>
									</div>
								</div>

								{selectedTexture && (
									<div className='mt-2 relative'>
										<div className='relative w-24 h-24 border border-gray-600 rounded overflow-hidden'>
											<div
												className='absolute inset-0'
												style={{
													backgroundImage: `url(${selectedTexture})`,
													backgroundSize: "cover",
													backgroundPosition: "center",
												}}></div>
											<button
												onClick={handleClearTexture}
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
									<input
										type='file'
										accept='image/*'
										onChange={(e) =>
											handleDoorTextureChange(e.target.files?.[0])
										}
										className='hidden'
										id='doorTextureInput'
									/>
									<label
										htmlFor='doorTextureInput'
										className='flex items-center justify-center w-12 h-12 bg-gray-700 text-white rounded cursor-pointer hover:bg-gray-600'>
										<MdOutlineTexture className='h-6 w-6' />
									</label>
								</div>
							</div>

							{/* Preview the selected door texture */}
							{doorTexture && (
								<div className='mt-2 relative'>
									<div className='relative w-24 h-24 border border-gray-600 rounded overflow-hidden'>
										<div
											className='absolute inset-0'
											style={{
												backgroundImage: `url(${doorTexture})`,
												backgroundSize: "cover",
												backgroundPosition: "center",
											}}></div>
										<button
											onClick={handleClearDoorTexture}
											className='absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600'
											title='Usuń teksturę'>
											X
										</button>
									</div>
								</div>
							)}

							{/* Door Transformation Controls */}
							{currentRoom?.door && doorTexture && (
								<div className='mt-4'>
									<h5 className='text-sm font-bold text-white mb-2'>
										Transformacje
									</h5>

									{/* Rotation Control with both slider and number input */}
									<div className='mb-2'>
										<label className='text-sm text-gray-300 block mb-1'>
											Rotacja tekstury:
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

						{/* Selected Riddle Indicator for positioning */}
						{selectedRiddle && (
							<div className='mb-4 p-2 bg-yellow-600 bg-opacity-20 rounded'>
								<div className='flex justify-between items-center'>
									<span className='text-sm text-white'>
										Wybrana zagadka do przeniesienia
									</span>
									<button
										onClick={() => dispatch(setSelectedRiddle(null))}
										className='text-xs text-red-400'>
										Odznacz
									</button>
								</div>
								<p className='text-xs text-gray-300 mt-1'>
									Kliknij na siatkę, aby przenieść zagadkę
								</p>
							</div>
						)}

						{/* List of existing riddles */}
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
												selectedRiddleId === riddle.id
													? "bg-gray-600"
													: selectedRiddle === riddle.id
													? "bg-mainMint bg-opacity-20"
													: "bg-gray-700"
											} rounded cursor-pointer`}
											onClick={() => {
												if (selectedRiddle === riddle.id) {
													// If already selected for positioning, select for editing
													dispatch(setSelectedRiddle(null));
													setSelectedRiddleId(riddle.id);
													setRiddleTitle(riddle.data?.title || "");
													setRiddleType(riddle.type || RIDDLE_TYPES.KNOWLEDGE);
													setRiddleQuestion(riddle.data?.question || "");
													setRiddleAnswer(riddle.data?.answer || "");
													setRiddleHints(riddle.data?.hints || []);
												} else if (selectedRiddleId === riddle.id) {
													// If already selected for editing, select for positioning
													setSelectedRiddleId(null);
													dispatch(setSelectedRiddle(riddle.id));
												} else {
													// Not selected at all, select for editing
													setSelectedRiddleId(riddle.id);
													setRiddleTitle(riddle.data?.title || "");
													setRiddleType(riddle.type || RIDDLE_TYPES.KNOWLEDGE);
													setRiddleQuestion(riddle.data?.question || "");
													setRiddleAnswer(riddle.data?.answer || "");
													setRiddleHints(riddle.data?.hints || []);
												}
											}}>
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
												{selectedRiddleId !== riddle.id && (
													<button
														onClick={(e) => {
															e.stopPropagation();
															dispatch(setSelectedRiddle(riddle.id));
															setSelectedRiddleId(null);
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
								{selectedRiddleId ? "Edytuj zagadkę" : "Dodaj nową zagadkę"}
							</h5>

							<input
								type='text'
								value={riddleTitle}
								onChange={(e) => setRiddleTitle(e.target.value)}
								placeholder='Tytuł zagadki'
								className='w-full px-2 py-1 bg-gray-700 text-white rounded text-sm mb-2'
							/>

							<select
								value={riddleType}
								onChange={(e) => setRiddleType(e.target.value)}
								className='w-full px-2 py-1 bg-gray-700 text-white rounded text-sm mb-2'>
								{Object.entries(RIDDLE_TYPES).map(([key, value]) => (
									<option key={key} value={value}>
										{key}
									</option>
								))}
							</select>

							<textarea
								value={riddleQuestion}
								onChange={(e) => setRiddleQuestion(e.target.value)}
								placeholder='Treść zagadki'
								className='w-full px-2 py-1 bg-gray-700 text-white rounded text-sm h-20 mb-2'
							/>

							<input
								type='text'
								value={riddleAnswer}
								onChange={(e) => setRiddleAnswer(e.target.value)}
								placeholder='Odpowiedź'
								className='w-full px-2 py-1 bg-gray-700 text-white rounded text-sm mb-2'
							/>

							{/* Hints section */}
							<div className='mb-2'>
								<label className='text-xs text-gray-300 block mb-1'>
									Podpowiedzi:
								</label>
								{riddleHints.map((hint, index) => (
									<div
										key={index}
										className='flex justify-between items-center mb-1'>
										<span className='text-xs text-gray-300'>{hint}</span>
										<button
											onClick={() =>
												setRiddleHints(
													riddleHints.filter((_, i) => i !== index),
												)
											}
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
								{selectedRiddleId ? (
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
											!riddleTitle.trim() ||
											!riddleQuestion.trim() ||
											!riddleAnswer.trim()
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

						{/* Current Room Props */}
						<h5 className='text-sm font-bold text-white mb-2'>
							Przedmioty w pokoju
						</h5>
						{currentRoom.props?.length ? (
							<ul className='text-sm text-gray-300 mb-4 max-h-40 overflow-y-auto'>
								{currentRoom.props.map((prop) => (
									<li
										key={prop.id}
										className='flex justify-between items-center mb-2 p-2 bg-gray-700 rounded'>
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
										<button
											onClick={() => handleRemoveProp(prop.id)}
											className='text-red-500 text-xs'>
											Usuń
										</button>
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
		<div className='w-64 pt-14 mx-4 bg-gray-800 p-6 border-l border-gray-600 h-full overflow-y-auto'>
			{renderToolOptions()}
		</div>
	);
};

export default RightSidebar;
