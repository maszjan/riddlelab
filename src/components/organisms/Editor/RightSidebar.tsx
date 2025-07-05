/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { RiddleFormState, RiddleType } from "../../../interfaces";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store";
import { v4 as uuidv4 } from "uuid";
import { IoCloudUpload } from "react-icons/io5";
import {
	setSelectedRiddle,
	removeRiddle,
	addProp,
	removeProp,
	setSelectedProp,
	clearRoom,
	updateMetadata,
	updateWalls,
	updateWallThickness,
	acceptFloor,
	updatePropRotation,
	updatePropReflection,
	setFloorAndTexture,
	setDoorTexture,
	updateDoorTransformation,
	setCurrentRoom,
	addRoom,
	removeRoom,
} from "../../../store/slices/editorSlice";
import { isGridFilled, isBorderClosed } from "../../../utils/editorHelpers";
import { MdOutlineTexture } from "react-icons/md";
import { FiPlusCircle } from "react-icons/fi";
import AddRiddleModal from "../Riddles/AddRiddleModal";
import EditRiddleModal from "../Riddles/EditRiddleModal";
import AssetPickerModal from "./AssetPickerModal";
import useGetAsset from "../../../hooks/useGetAsset";
import SaveEscapeRoomModal from "../EscapeRooms/SaveEscapeRoomModal";

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
	const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
	const [selectedPropAssetId, setSelectedPropAssetId] = useState<number | null>(
		null,
	);
	const [selectedTexture, setSelectedTexture] = useState<string | null>(null);
	const { asset: selectedPropAssetDetails } = useGetAsset(selectedPropAssetId);
	const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
	const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);
	const [currentAssetType, setCurrentAssetType] = useState<string>("floor");
	const { asset: selectedAssetDetails } = useGetAsset(selectedAssetId);
	const [wallColor, setWallColor] = useState<string>(
		currentRoom?.wallColor || "#888888",
	);
	const [wallThickness, setWallThickness] = useState<number>(
		currentRoom?.wallThickness || 6,
	);

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

	// Props states
	const [propName, setPropName] = useState<string>("");
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
		type: "knowledge" as RiddleType,
		question: "",
		answer: "",
		hints: [],
		isEditing: false,
	});
	const [isAddRiddleModalOpen, setIsAddRiddleModalOpen] = useState(false);
	const [editingRiddleId, setEditingRiddleId] = useState<string | null>(null);

	const resetRiddleForm = () => {
		setRiddleForm({
			id: null,
			title: "",
			type: "knowledge" as RiddleType,
			question: "",
			answer: "",
			hints: [],
			isEditing: false,
		});
		setEditingRiddleId(null);
	};

	// const handleEditRiddle = (riddle: any) => {
	// 	setRiddleForm({
	// 		id: riddle.id,
	// 		title: riddle.title || "",
	// 		type: riddle.type || "knowledge",
	// 		question: riddle.question || "",
	// 		answer: riddle.answer || "",
	// 		hints: riddle.hints || [],
	// 		isEditing: true,
	// 	});
	// 	setEditingRiddleId(riddle.id);
	// 	setIsAddRiddleModalOpen(true);
	// };

	// const handleSaveRiddleEdit = (updatedRiddle: any) => {
	// 	if (editingRiddleId && currentRoom) {
	// 		dispatch(
	// 			updateRiddle({
	// 				roomId: currentRoom.id,
	// 				riddleId: editingRiddleId,
	// 				riddleData: updatedRiddle,
	// 			}),
	// 		);
	// 		resetRiddleForm();
	// 	}
	// };

	const handleClearWallColor = () => {
		setWallColor("#888888");
	};

	const handleRemoveProp = (propId: string) => {
		if (currentRoom) {
			dispatch(
				removeProp({
					roomId: currentRoom.id,
					propId,
				}),
			);
			dispatch(setSelectedProp(null));
		}
	};

	const handleApplyDoorTexture = () => {
		dispatch(
			setDoorTexture({
				texture: selectedAssetDetails?.url || null,
				doorTextureAssetId: selectedAssetDetails?.id || null,
			}),
		);
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
		let texturePath = null;
		if (selectedAssetDetails?.url) {
			const urlObj = new URL(selectedAssetDetails.url);
			texturePath = urlObj.pathname;
		}

		dispatch(
			setFloorAndTexture({
				color: null,
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

	const handleAddRoom = () => {
		if (!currentEscapeRoom?.rooms) return;

		if (currentEscapeRoom.rooms.length >= 3) {
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
				door: {
					row: 0,
					col: 0,
					rotation: 0,
					scaleX: 1,
					scaleY: 1,
					opacity: 1,
				},
				doorTexture: null,
				startingPoint: null,
				riddles: [],
				props: [],
				floorAccepted: false,
				floorTextureAssetId: floorAssetId,
				doorTextureAssetId: doorAssetId,
			}),
		);
		dispatch(setCurrentRoom(roomId));
	};

	const handleRemoveRoom = (roomId: string) => {
		if (
			currentEscapeRoom?.rooms?.length &&
			currentEscapeRoom.rooms.length > 1
		) {
			dispatch(removeRoom({ roomId }));
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

	const handleAddPropFromLibrary = (libraryProp: any) => {
		if (currentRoom) {
			dispatch(
				addProp({
					roomId: currentRoom.id,
					prop: {
						id: `prop-${uuidv4()}`,
						name: libraryProp.name,
						imageUrl: libraryProp.imageUrl,
						assetId: libraryProp.assetId || null,
						position: { row: 0, col: 0 },
						rotation: 0,
						flipHorizontal: false,
						flipVertical: false,
						hasCollider: libraryProp.hasCollider,
					},
				}),
			);
		}
	};

	const handleClearRoom = () => {
		dispatch(clearRoom());
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
		}
	}, [currentEscapeRoom]);

	useEffect(() => {
		if (currentRoom) {
			setWallColor(currentRoom.wallColor || "#888888");
			setWallThickness(currentRoom.wallThickness || 6);
			setFloorAssetId(currentRoom.floorTextureAssetId || null);
			setDoorAssetId(currentRoom.doorTextureAssetId || null);

			if (selectedTool === "paintFloor" && currentRoom.floorTextureAssetId) {
				setSelectedAssetId(currentRoom.floorTextureAssetId);
				setCurrentAssetType("floor");
			} else if (selectedTool === "door" && currentRoom.doorTextureAssetId) {
				setSelectedAssetId(currentRoom.doorTextureAssetId);
				setCurrentAssetType("door");
			}
		}
	}, [currentRoom, selectedTool]);

	const handleAddPropFromAsset = () => {
		if (selectedPropAssetDetails && propName.trim() && currentRoom) {
			const newProp = {
				id: `prop-${uuidv4()}`,
				name: propName,
				imageUrl: selectedPropAssetDetails.url,
				assetId: selectedPropAssetId,
				position: { row: 0, col: 0 },
				rotation: 0,
				flipHorizontal: false,
				flipVertical: false,
				hasCollider: propHasCollider,
			};

			dispatch(
				addProp({
					roomId: currentRoom.id,
					prop: newProp,
				}),
			);

			setPropName("");
			setPropHasCollider(false);
			setSelectedPropAssetId(null);
		}
	};

	const getDisplayUrl = (url: string | null | undefined): string | null => {
		if (!url) return null;

		if (url.startsWith("http")) {
			return url;
		}

		if (url.startsWith("/storage/")) {
			return `${import.meta.env.VITE_API_BASE_URL}${url}`;
		} else if (url.startsWith("textures/")) {
			return `${import.meta.env.VITE_API_BASE_URL}/storage/${url}`;
		} else if (url.startsWith("/")) {
			return `${import.meta.env.VITE_API_BASE_URL}/storage${url}`;
		} else {
			return `${import.meta.env.VITE_API_BASE_URL}/storage/${url}`;
		}
	};

	useEffect(() => {
		if (currentRoom) {
			setWallColor(currentRoom.wallColor || "#888888");
			setWallThickness(currentRoom.wallThickness || 6);

			setFloorAssetId(currentRoom.floorTextureAssetId || null);
			setDoorAssetId(currentRoom.doorTextureAssetId || null);

			if (selectedTool === "paintFloor" && currentRoom.floorTextureAssetId) {
				setSelectedAssetId(currentRoom.floorTextureAssetId);
				setCurrentAssetType("floor");
			} else if (selectedTool === "door" && currentRoom.doorTextureAssetId) {
				setSelectedAssetId(currentRoom.doorTextureAssetId);
				setCurrentAssetType("door");
			}

			if (currentRoom.floorTexture) {
				setSelectedTexture(getDisplayUrl(currentRoom.floorTexture));
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
								Tekstura podłogi
							</h4>
							<p className='text-sm text-gray-300 mb-2'>
								Wybierz teksturę dla podłogi
							</p>

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

								{(selectedAssetDetails?.url || selectedTexture) && (
									<div className='mt-2 relative'>
										<div className='relative w-24 h-24 border border-gray-600 rounded overflow-hidden'>
											<div
												className='absolute inset-0'
												style={{
													backgroundImage: `url(${
														selectedAssetDetails?.url || selectedTexture
													})`,
													backgroundSize: "cover",
													backgroundPosition: "center",
												}}></div>
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
							<div className='flex items-center justify-between'>
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
							{/* Apply wall changes button */}
							<button
								onClick={handleApplyChanges}
								className='w-24 bg-mainMint font-semibold text-gray-700 py-2 rounded mt-4'>
								Użyj
							</button>
						</div>
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
												dispatch(
													setDoorTexture({
														texture: null,
														doorTextureAssetId: null, // Fix: add missing property
													}),
												);
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

			// In the renderToolOptions function, keep only this riddle case:

			case "riddle":
				return (
					<div>
						<h4 className='text-md font-bold text-white mb-4'>
							Zarządzanie zagadkami
						</h4>

						<button
							className='mb-4 w-full bg-mainMint text-gray-700 py-2 rounded font-semibold flex items-center justify-center'
							onClick={() => {
								resetRiddleForm();
								setIsAddRiddleModalOpen(true);
							}}>
							<FiPlusCircle className='mr-2' /> Dodaj nową zagadkę
						</button>

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
								<div className='grid grid-cols-2 gap-3'>
									{currentRoom.riddles.map((riddle) => {
										// Fix: Handle both full URLs and relative paths
										let imgUrl = null;

										if (riddle.texture) {
											// If texture starts with http, use it directly
											if (riddle.texture.startsWith("http")) {
												imgUrl = riddle.texture;
											} else {
												// If it's a relative path, prepend the base URL
												imgUrl = `http://localhost:8000${riddle.texture}`;
											}
										} else if (riddle.assetId) {
											imgUrl = getDisplayUrl(riddle.assetId.toString());
										}

										const isSelected = selectedRiddle === riddle.id;

										return (
											<div
												key={riddle.id}
												className={`relative flex flex-col items-center justify-between rounded-lg shadow-md border-2 ${
													isSelected ? "border-mainMint" : "border-gray-700"
												} bg-gray-700 overflow-hidden cursor-pointer group`}
												style={{ width: 110, height: 110 }}
												onClick={() => dispatch(setSelectedRiddle(riddle.id))}>
												{/* Image */}
												<div className='w-full h-14 bg-gray-900 flex items-center justify-center'>
													{imgUrl ? (
														<img
															src={imgUrl}
															alt={
																(riddle as any).data?.title ||
																riddle.title ||
																"Zagadka"
															}
															className='w-full h-full object-cover'
															style={{ minHeight: 56, maxHeight: 56 }}
															onError={(e) => {
																console.log("Image failed to load:", imgUrl);
																// Hide the img and show the fallback
																e.currentTarget.style.display = "none";
																const fallback =
																	e.currentTarget.parentElement?.querySelector(
																		".fallback-icon",
																	);
																if (fallback) {
																	(fallback as HTMLElement).style.display =
																		"flex";
																}
															}}
														/>
													) : null}
													<div
														className='fallback-icon w-full h-full flex items-center justify-center text-gray-400 text-2xl'
														style={{ display: imgUrl ? "none" : "flex" }}>
														?
													</div>
												</div>
												{/* Title - Fix data access with type assertion */}
												<div className='w-full px-2 py-1 bg-gray-800 text-center truncate text-xs font-bold text-white'>
													{(riddle as any).data?.title ||
														riddle.title ||
														`Zagadka #${riddle.id.slice(-4)}`}
												</div>
												{/* Action buttons */}
												<div className='absolute top-1 right-1 flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition'>
													<button
														onClick={(e) => {
															e.stopPropagation();
															setEditingRiddleId(riddle.id);
														}}
														className='bg-blue-600 text-white text-xs px-2 py-1 rounded hover:bg-blue-700 flex items-center'
														title='Edytuj zagadkę'>
														Edytuj
													</button>
													<button
														onClick={(e) => {
															e.stopPropagation();
															dispatch(setSelectedRiddle(riddle.id));
														}}
														className='bg-mainMint text-gray-900 text-xs px-2 py-1 rounded hover:bg-mainMint/80'>
														Przenieś
													</button>
													<button
														onClick={(e) => {
															e.stopPropagation();
															dispatch(removeRiddle({ riddleId: riddle.id }));
														}}
														className='bg-red-600 text-white text-xs px-2 py-1 rounded hover:bg-red-700'>
														Usuń
													</button>
												</div>
											</div>
										);
									})}
								</div>
							</div>
						) : (
							<p className='text-sm text-gray-300 mb-4'>
								Brak zagadek. Dodaj pierwszą!
							</p>
						)}

						{/* Add Riddle Modal - for creating new riddles */}
						<AddRiddleModal
							isOpen={isAddRiddleModalOpen}
							onClose={() => {
								setIsAddRiddleModalOpen(false);
								resetRiddleForm();
							}}
						/>

						{/* Edit Riddle Modal - for editing existing riddles */}
						<EditRiddleModal
							isOpen={!!editingRiddleId}
							onClose={() => setEditingRiddleId(null)}
							riddle={currentRoom?.riddles?.find(
								(r) => r.id === editingRiddleId,
							)}
						/>

						{riddleForm.id && (
							<div className='mb-4'>
								<button
									onClick={resetRiddleForm}
									className='text-xs text-gray-400 hover:text-white'>
									Wyczyść formularz
								</button>
							</div>
						)}
					</div>
				);

			// Remove ALL other duplicate case "riddle": statements after this one
			case "props":
				return (
					<div>
						<h4 className='text-md font-bold text-white mb-4'>Przedmioty</h4>

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
						{currentRoom?.props?.length ? (
							<ul className='text-sm text-gray-300 mb-4 max-h-60 overflow-y-auto'>
								{currentRoom.props.map((prop) => {
									const displayUrl = getDisplayUrl(prop.imageUrl || null);
									const isSelected = selectedProp === prop.id;

									return (
										<li
											key={prop.id}
											className={`mb-3 p-3 ${
												isSelected
													? "bg-mainMint bg-opacity-20 border border-mainMint"
													: "bg-gray-700"
											} rounded`}>
											<div className='flex items-center justify-between mb-2'>
												<div className='flex items-center'>
													<div className='w-8 h-8 mr-2 bg-gray-600 rounded overflow-hidden'>
														{displayUrl && (
															<img
																src={displayUrl}
																alt={prop.name}
																className='w-full h-full object-cover'
																style={{
																	transform: `
                                                        scaleX(${
																													prop.flipHorizontal
																														? -1
																														: 1
																												}) 
                                                        scaleY(${
																													prop.flipVertical
																														? -1
																														: 1
																												})
                                                        rotate(${
																													prop.rotation || 0
																												}deg)
                                                    `,
																}}
																onError={() => {
																	// Fix: remove unused parameter
																	console.error(
																		"Failed to load prop image:",
																		displayUrl,
																	);
																}}
															/>
														)}
													</div>
													<span className='text-xs font-medium'>
														{prop.name}
													</span>
												</div>
												<div className='flex gap-1'>
													<button
														onClick={() =>
															dispatch(
																setSelectedProp(
																	selectedProp === prop.id ? null : prop.id,
																),
															)
														}
														className='text-blue-400 text-xs px-2 py-1 bg-blue-900 rounded hover:bg-blue-800'>
														{selectedProp === prop.id ? "Anuluj" : "Przenieś"}
													</button>
													<button
														onClick={() => handleRemoveProp(prop.id)}
														className='text-red-400 text-xs px-2 py-1 bg-red-900 rounded hover:bg-red-800'>
														Usuń
													</button>
												</div>
											</div>

											{/* Rotation and Reflection controls - show when prop is selected */}
											{isSelected && (
												<div className='mt-2 pt-2 border-t border-gray-600'>
													{/* Rotation controls */}
													<div className='mb-3'>
														<label className='text-xs text-gray-300 block mb-1'>
															Rotacja przedmiotu:
														</label>
														<div className='flex items-center gap-2'>
															<input
																type='range'
																min={0}
																max={360}
																value={prop.rotation || 0}
																onChange={(e) =>
																	dispatch(
																		updatePropRotation({
																			propId: prop.id,
																			rotation: parseInt(e.target.value),
																		}),
																	)
																}
																className='flex-1 accent-mainMint'
															/>
															<input
																type='number'
																min={0}
																max={360}
																value={prop.rotation || 0}
																onChange={(e) =>
																	dispatch(
																		updatePropRotation({
																			propId: prop.id,
																			rotation: parseInt(e.target.value) || 0,
																		}),
																	)
																}
																className='w-16 bg-gray-600 text-white rounded px-2 py-1 text-xs'
															/>
															<span className='text-xs text-gray-300'>°</span>
														</div>
													</div>

													{/* Quick rotation buttons */}
													<div className='flex gap-1 mb-3'>
														{[0, 90, 180, 270].map((rotation) => (
															<button
																key={rotation}
																onClick={() =>
																	dispatch(
																		updatePropRotation({
																			propId: prop.id,
																			rotation,
																		}),
																	)
																}
																className={`text-xs px-2 py-1 rounded transition-colors ${
																	prop.rotation === rotation
																		? "bg-mainMint text-gray-900"
																		: "bg-gray-600 text-gray-300 hover:bg-gray-500"
																}`}>
																{rotation}°
															</button>
														))}
													</div>

													{/* Image Reflection controls */}
													<div className='mb-2'>
														<label className='text-xs text-gray-300 block mb-2'>
															Odbicie obrazu:
														</label>
														<div className='flex gap-2'>
															<button
																onClick={() =>
																	dispatch(
																		updatePropReflection({
																			propId: prop.id,
																			flipHorizontal: !(
																				prop.flipHorizontal || false
																			),
																		}),
																	)
																}
																className={`flex-1 text-xs px-2 py-1 rounded transition-colors ${
																	prop.flipHorizontal
																		? "bg-mainMint text-gray-900"
																		: "bg-gray-600 text-gray-300 hover:bg-gray-500"
																}`}>
																↔ Poziomo
															</button>
															<button
																onClick={() =>
																	dispatch(
																		updatePropReflection({
																			propId: prop.id,
																			flipVertical: !(
																				prop.flipVertical || false
																			),
																		}),
																	)
																}
																className={`flex-1 text-xs px-2 py-1 rounded transition-colors ${
																	prop.flipVertical
																		? "bg-mainMint text-gray-900"
																		: "bg-gray-600 text-gray-300 hover:bg-gray-500"
																}`}>
																↕ Pionowo
															</button>
														</div>
													</div>

													{/* Reset transformations button */}
													<button
														onClick={() => {
															dispatch(
																updatePropRotation({
																	propId: prop.id,
																	rotation: 0,
																}),
															);
															dispatch(
																updatePropReflection({
																	propId: prop.id,
																	flipHorizontal: false,
																	flipVertical: false,
																}),
															);
														}}
														className='w-full text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors'>
														Resetuj transformacje
													</button>
												</div>
											)}
										</li>
									);
								})}
							</ul>
						) : (
							<p className='text-sm text-gray-300 mb-4'>Brak przedmiotów.</p>
						)}

						<div className='mb-4'>
							<button
								onClick={() => {
									setCurrentAssetType("prop");
									setIsAssetModalOpen(true);
								}}
								className='w-full py-2 bg-mainMint text-gray-700 rounded font-semibold'>
								Wybierz
							</button>

							{selectedPropAssetDetails && (
								<div className='mt-2 p-2 bg-gray-700 rounded'>
									<div className='flex items-center mb-2'>
										<div className='w-12 h-12 mr-2 bg-gray-600 rounded overflow-hidden'>
											<img
												src={selectedPropAssetDetails.url}
												alt={selectedPropAssetDetails.name}
												className='w-full h-full object-cover'
											/>
										</div>
										<span className='text-sm text-white'>
											{selectedPropAssetDetails.name}
										</span>
									</div>
									<input
										type='text'
										placeholder='Nazwa przedmiotu'
										value={propName}
										onChange={(e) => setPropName(e.target.value)}
										className='w-full px-2 py-1 bg-gray-600 text-white rounded mb-2'
									/>
									<div className='flex items-center mb-2'>
										<input
											type='checkbox'
											id='propHasCollider'
											checked={propHasCollider}
											onChange={(e) => setPropHasCollider(e.target.checked)}
											className='mr-2'
										/>
										<label
											htmlFor='propHasCollider'
											className='text-sm text-gray-300'>
											Ma kolizję (blokuje ruch)
										</label>
									</div>
									<button
										onClick={handleAddPropFromAsset}
										disabled={!propName.trim()}
										className={`w-full py-1 rounded font-semibold ${
											propName.trim()
												? "bg-mainMint text-gray-700"
												: "bg-gray-600 text-gray-400 cursor-not-allowed"
										}`}>
										Dodaj Przedmiot
									</button>
								</div>
							)}
						</div>

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
								onChange={(e) => {
									setMetadataName(e.target.value);
									// Update Redux store immediately
									dispatch(
										updateMetadata({ key: "name", value: e.target.value }),
									);
								}}
								className='w-full px-2 py-1 bg-gray-700 text-white rounded text-sm'
							/>
						</div>
						<div className='mb-4'>
							<label className='text-sm text-gray-300 block mb-1'>Opis:</label>
							<textarea
								value={metadataDescription}
								onChange={(e) => {
									setMetadataDescription(e.target.value);
									// Update Redux store immediately
									dispatch(
										updateMetadata({
											key: "description",
											value: e.target.value,
										}),
									);
								}}
								className='w-full px-2 py-1 bg-gray-700 text-white rounded text-sm h-20'
							/>
						</div>

						<div className='mt-6 pt-4 border-t border-gray-700'>
							<h5 className='text-sm font-bold text-white mb-2'>
								Zapisz Escape Room
							</h5>
							<button
								onClick={() => setIsSaveModalOpen(true)}
								className='w-full py-3 bg-mainMint text-gray-800 rounded-lg font-semibold hover:bg-opacity-50 transition-colors flex items-center justify-center'>
								<IoCloudUpload className='mr-2' size={16} />
								Zapisz
							</button>
						</div>
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
									{currentEscapeRoom?.rooms?.map(
										(
											room,
											index, // Fix: add optional chaining
										) => (
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
													disabled={
														(currentEscapeRoom?.rooms?.length || 0) <= 1
													}>
													{" "}
													{/* Fix: add optional chaining */}X
												</button>
											</li>
										),
									)}
								</ul>

								{/* Add room button without input field */}
								{(currentEscapeRoom?.rooms?.length || 0) < 3 && ( // Fix: add optional chaining
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
						dispatch(
							setDoorTexture({
								texture: selectedAssetDetails?.url || null,
								doorTextureAssetId: selectedAssetDetails?.id || null,
							}),
						);
					} else if (currentAssetType === "prop") {
						setSelectedPropAssetId(assetId);
					}
				}}
				assetType={currentAssetType}
				title={`Wybierz ${
					currentAssetType === "floor"
						? "teksturę podłogi"
						: currentAssetType === "door"
						? "teksturę drzwi"
						: currentAssetType === "prop"
						? "asset dla przedmiotu"
						: "zasób"
				}`}
			/>
			<SaveEscapeRoomModal
				isOpen={isSaveModalOpen}
				onClose={() => setIsSaveModalOpen(false)}
				onSuccess={() => {
					console.log("Escape Room saved successfully!");
				}}
			/>
		</>
	);
};

export default RightSidebar;
