import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store";
import {
	addAsset,
	removeAsset,
	clearRoom,
	updateMetadata,
	updateWalls,
	updateWallThickness,
	acceptFloor,
	setFloorAndTexture,
	setDoorTexture,
} from "../../../store/slices/editorSlice";
import { isGridFilled, isBorderClosed } from "../../../utils/editorHelpers";
import { MdOutlineTexture } from "react-icons/md";

const RightSidebar = () => {
	const dispatch = useDispatch();
	const selectedTool = useSelector(
		(state: RootState) => state.editor.selectedTool,
	);
	const currentEscapeRoomId = useSelector(
		(state: RootState) => state.editor.currentEscapeRoomId,
	);
	const currentRoom = useSelector((state: RootState) => {
		const escapeRoom = state.editor.escapeRooms.find(
			(er) => er.id === currentEscapeRoomId,
		);
		return escapeRoom?.rooms.find(
			(room) => room.id === state.editor.currentRoomId,
		);
	});
	const [newAssetName, setNewAssetName] = useState("");
	const [newAssetUrl, setNewAssetUrl] = useState("");
	const [floorColor, setFloorColor] = useState(
		currentRoom?.floorColor || "#cccccc",
	);
	const [selectedTexture, setSelectedTexture] = useState<string | null>(null); // Temporary texture state
	const [wallColor, setWallColor] = useState(
		currentRoom?.wallColor || "#888888",
	);
	const [wallThickness, setWallThickness] = useState(
		currentRoom?.wallThickness || 6,
	);
	const [colorOpacity, setColorOpacity] = useState(1);
	const [isBorderClosedState, setIsBorderClosedState] = useState(false);
	const [isGridFilledState, setIsGridFilledState] = useState(false);
	const [doorTexture, setDoorTextureState] = useState<string | null>(
		currentRoom?.doorTexture || null,
	);

	const handleClearFloorColor = () => {
		setFloorColor(null);
	};

	const handleClearWallColor = () => {
		setWallColor(null);
	};

	const handleOpacityChange = (opacity: number) => {
		setColorOpacity(opacity / 100); // Convert percentage to 0-1 range
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

	const handleAddAsset = () => {
		if (newAssetName && newAssetUrl) {
			dispatch(
				addAsset({
					id: `asset-${Date.now()}`,
					name: newAssetName,
					type: "image",
					url: newAssetUrl,
				}),
			);
			setNewAssetName("");
			setNewAssetUrl("");
		}
	};

	const handleRemoveAsset = (id: string) => {
		dispatch(removeAsset({ id }));
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
						<h4 className='text-md font-bold text-white mb-4'>Opcje Drzwi</h4>
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
						</div>
					</div>
				);
			case "startPoint":
				return (
					<div>
						<h4 className='text-md font-bold text-white mb-4'>
							Opcje Punktu Startowego
						</h4>
						<p className='text-sm text-gray-300'>
							Kliknij na siatkę, aby ustawić punkt startowy.
						</p>
					</div>
				);
			case "riddle":
				return (
					<div>
						<h4 className='text-md font-bold text-white mb-4'>Opcje Zagadek</h4>
						<p className='text-sm text-gray-300'>
							Kliknij na siatkę, aby dodać zagadkę.
						</p>
					</div>
				);
			case "assets":
				return (
					<div>
						<h4 className='text-md font-bold text-white mb-4'>Zasoby</h4>
						{currentRoom.assets?.length ? (
							<ul className='text-sm text-gray-300 mb-4'>
								{currentRoom.assets.map((asset) => (
									<li
										key={asset.id}
										className='flex justify-between items-center mb-2'>
										<span>{asset.name}</span>
										<button
											onClick={() => handleRemoveAsset(asset.id)}
											className='text-red-500 text-xs'>
											Usuń
										</button>
									</li>
								))}
							</ul>
						) : (
							<p className='text-sm text-gray-300 mb-4'>Brak zasobów.</p>
						)}
						<input
							type='text'
							placeholder='Nazwa zasobu'
							value={newAssetName}
							onChange={(e) => setNewAssetName(e.target.value)}
							className='w-full px-2 py-1 bg-gray-700 text-white rounded mb-2'
						/>
						<input
							type='text'
							placeholder='URL zasobu'
							value={newAssetUrl}
							onChange={(e) => setNewAssetUrl(e.target.value)}
							className='w-full px-2 py-1 bg-gray-700 text-white rounded mb-4'
						/>
						<button
							onClick={handleAddAsset}
							className='w-full bg-blue-500 text-white py-2 rounded'>
							Dodaj Zasób
						</button>
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
		<div className='w-64 pt-14 bg-gray-800 p-6 border-l border-gray-600 h-full overflow-y-auto'>
			{renderToolOptions()}
		</div>
	);
};

export default RightSidebar;
