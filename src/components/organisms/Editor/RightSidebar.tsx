import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store";
import { v4 as uuidv4 } from "uuid";
import {
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
						<h4 className='text-md font-bold text-white mb-4'>Opcje zagadek</h4>
						<p className='text-sm text-gray-300'>
							Kliknij na siatkę, aby dodać zagadkę.
						</p>
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
